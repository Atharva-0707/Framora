const mongoose = require('mongoose');
const Post = require('../models/Post');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const razorpayService = require('../services/razorpayService');
const { emitToPost } = require('../config/socket');
const { generateDownloadUrl, isCloudinaryConfigured } = require('../config/cloudinary');

// @desc    Create Razorpay order for purchasing a 1-of-1 photo
// @route   POST /api/purchases/:postId/create-order
// @access  Private
const createPurchaseOrder = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const buyerId = req.user._id;

    const post = await Post.findById(postId).populate('user', 'username name avatar');
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Photograph post not found.',
      });
    }

    // Confirm photo is currently FOR_SALE
    if (post.saleStatus !== 'FOR_SALE') {
      if (post.saleStatus === 'SOLD') {
        return res.status(400).json({
          success: false,
          message: 'This 1-of-1 photograph has already been sold.',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'This photograph is not currently listed for sale.',
      });
    }

    // Confirm buyer is not the seller
    const sellerId = post.user._id ? post.user._id.toString() : post.user.toString();
    if (sellerId === buyerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Photographers cannot purchase their own photographs.',
      });
    }

    // Server-side price authority (Never trust client price)
    const price = post.price;
    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price configured for this photograph.',
      });
    }

    const currency = post.currency || 'INR';

    // Create Razorpay order
    const razorpayOrder = await razorpayService.createOrder({
      amount: price,
      currency,
      receipt: `rcpt_${post._id.toString().substring(18)}_${Date.now().toString().substring(8)}`,
      notes: {
        postId: post._id.toString(),
        postTitle: post.title,
        sellerId: sellerId,
        buyerId: buyerId.toString(),
      },
    });

    // Create internal Purchase record with CREATED status - locked price for this transaction
    const purchase = await Purchase.create({
      buyer: buyerId,
      seller: post.user._id || post.user,
      post: post._id,
      amount: price,
      currency,
      razorpayOrderId: razorpayOrder.id,
      status: 'CREATED',
    });

    res.status(201).json({
      success: true,
      message: 'Razorpay order created successfully',
      orderId: razorpayOrder.id,
      amount: price,
      currency,
      keyId: process.env.RAZORPAY_KEY_ID || '',
      purchaseId: purchase._id,
      post: {
        _id: post._id,
        title: post.title,
        price: post.price,
        currency: post.currency,
        seller: {
          username: post.user.username,
          name: post.user.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature and atomically complete purchase
// @route   POST /api/purchases/:postId/verify
// @access  Private
const verifyPurchasePayment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification details missing (order_id and payment_id required).',
      });
    }

    const buyerId = req.user._id;

    // Load purchase record by Razorpay Order ID
    const purchase = await Purchase.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order record not found.',
      });
    }

    // 1. Verify Buyer Integrity (Authenticated user must match order buyer)
    if (purchase.buyer.toString() !== buyerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This purchase order belongs to a different collector.',
      });
    }

    // 2. Verify Post ↔ Purchase Integrity (URL postId must match stored purchase.post)
    if (purchase.post.toString() !== postId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Integrity mismatch: Payment order does not correspond to the requested photograph.',
      });
    }

    // 3. Idempotency: If purchase is already PAID, return success immediately
    if (purchase.status === 'PAID') {
      const post = await Post.findById(postId);
      return res.status(200).json({
        success: true,
        message: 'Payment already verified and purchase finalized.',
        purchase: {
          _id: purchase._id,
          status: purchase.status,
          amount: purchase.amount,
          currency: purchase.currency,
          razorpayPaymentId: purchase.razorpayPaymentId,
          completedAt: purchase.completedAt,
        },
        post: post
          ? {
              _id: post._id,
              title: post.title,
              saleStatus: post.saleStatus,
              soldAt: post.soldAt,
            }
          : null,
      });
    }

    // 4. Validate purchase state before finalization
    if (purchase.status !== 'CREATED' && purchase.status !== 'PAYMENT_PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot verify purchase with current status: ${purchase.status}`,
      });
    }

    // 5. Server-side Razorpay HMAC signature verification
    const isValidSignature = razorpayService.verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValidSignature) {
      purchase.status = 'FAILED';
      await purchase.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.',
      });
    }

    // 6. Verification of locked order amount against purchase record
    // The purchase.amount was locked when the order was created and is authoritative for this transaction.
    if (!purchase.amount || purchase.amount <= 0) {
      purchase.status = 'FAILED';
      await purchase.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase order amount recorded.',
      });
    }

    // 7. ATOMIC TRANSACTION & CONCURRENCY CHECK:
    // Transition post to SOLD and purchase to PAID atomically.
    // Handles MongoDB replica set transactions with graceful standalone fallback.
    const now = new Date();
    let updatedPost = null;
    let session = null;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

      updatedPost = await Post.findOneAndUpdate(
        {
          _id: postId,
          saleStatus: 'FOR_SALE',
        },
        {
          $set: {
            saleStatus: 'SOLD',
            soldTo: buyerId,
            soldAt: now,
          },
        },
        { new: true, session }
      );

      if (!updatedPost) {
        await session.abortTransaction();
        session.endSession();
        session = null;

        purchase.status = 'FAILED';
        await purchase.save();

        return res.status(409).json({
          success: false,
          message:
            'This 1-of-1 photograph was just purchased by another collector during transaction processing. Please contact support for an immediate refund if charged.',
        });
      }

      purchase.status = 'PAID';
      purchase.razorpayPaymentId = razorpay_payment_id;
      purchase.razorpaySignature = razorpay_signature || '';
      purchase.completedAt = now;
      await purchase.save({ session });

      await session.commitTransaction();
      session.endSession();
      session = null;
    } catch (txError) {
      if (session) {
        try {
          await session.abortTransaction();
          session.endSession();
        } catch (ignored) {}
        session = null;
      }

      // If transactions are not supported on standalone/in-memory Mongo instances, execute single-op atomic update
      const isStandaloneOrUnsupported =
        txError.message &&
        (txError.message.includes('replica set') ||
          txError.message.includes('Transaction numbers are only allowed on a replica set member or mongos') ||
          txError.message.includes('not supported') ||
          txError.message.includes('Transactions are not supported'));

      if (isStandaloneOrUnsupported) {
        updatedPost = await Post.findOneAndUpdate(
          {
            _id: postId,
            saleStatus: 'FOR_SALE',
          },
          {
            $set: {
              saleStatus: 'SOLD',
              soldTo: buyerId,
              soldAt: now,
            },
          },
          { new: true }
        );

        if (!updatedPost) {
          purchase.status = 'FAILED';
          await purchase.save();

          return res.status(409).json({
            success: false,
            message:
              'This 1-of-1 photograph was just purchased by another collector during transaction processing. Please contact support for an immediate refund if charged.',
          });
        }

        purchase.status = 'PAID';
        purchase.razorpayPaymentId = razorpay_payment_id;
        purchase.razorpaySignature = razorpay_signature || '';
        purchase.completedAt = now;
        await purchase.save();
      } else {
        throw txError;
      }
    }

    // Broadcast safe Socket.IO event to all viewers of this post
    emitToPost(postId, 'photo:sold', {
      postId: updatedPost._id.toString(),
      saleStatus: 'SOLD',
      soldAt: now,
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Photograph ownership transferred.',
      purchase: {
        _id: purchase._id,
        status: purchase.status,
        amount: purchase.amount,
        currency: purchase.currency,
        razorpayPaymentId: purchase.razorpayPaymentId,
        completedAt: purchase.completedAt,
      },
      post: {
        _id: updatedPost._id,
        title: updatedPost.title,
        saleStatus: updatedPost.saleStatus,
        soldAt: updatedPost.soldAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's purchased photos (Buyer history)
// @route   GET /api/purchases/me
// @access  Private
const getMyPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find({
      buyer: req.user._id,
      status: 'PAID',
    })
      .populate({
        path: 'post',
        select: 'title caption imageUrl location camera lens price currency saleStatus soldAt',
      })
      .populate('seller', 'username name avatar')
      .sort({ completedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: purchases.length,
      purchases,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get photographer's sold photos & earnings (Seller history)
// @route   GET /api/purchases/sales
// @access  Private
const getMySales = async (req, res, next) => {
  try {
    const sales = await Purchase.find({
      seller: req.user._id,
      status: 'PAID',
    })
      .populate({
        path: 'post',
        select: 'title caption imageUrl price currency saleStatus soldAt',
      })
      .populate('buyer', 'username name avatar')
      .sort({ completedAt: -1, createdAt: -1 });

    const totalEarnings = sales.reduce((sum, item) => sum + (item.amount || 0), 0);

    res.status(200).json({
      success: true,
      count: sales.length,
      totalEarnings,
      sales,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get authorized original download access for purchased photo
// @route   GET /api/purchases/download/:postId
// @access  Private (Buyer, Seller or Admin only)
const getDownloadAccess = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate('user', 'username name');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Photograph post not found.',
      });
    }

    const userId = req.user._id.toString();
    const isBuyer = post.soldTo && post.soldTo.toString() === userId;
    const isSeller = post.user && (post.user._id ? post.user._id.toString() : post.user.toString()) === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not hold ownership or rights to download this original digital asset.',
      });
    }

    // Verify legitimate completed purchase record if buyer
    if (isBuyer) {
      const purchase = await Purchase.findOne({
        post: post._id,
        buyer: req.user._id,
        status: 'PAID',
      });
      if (!purchase) {
        return res.status(403).json({
          success: false,
          message: 'No verified completed purchase record found for this photograph.',
        });
      }
    }

    // Clean sanitized filename for download
    const cleanTitle = (post.title || 'framora_photo')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();

    // Generate authorized high-resolution master download URL
    const downloadUrl = generateDownloadUrl(post.imagePublicId, post.imageUrl, cleanTitle);

    res.status(200).json({
      success: true,
      downloadUrl,
      title: post.title,
      filename: `${cleanTitle}_original.jpg`,
      licenseInfo: post.licenseInfo,
      soldAt: post.soldAt,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPurchaseOrder,
  verifyPurchasePayment,
  getMyPurchases,
  getMySales,
  getDownloadAccess,
};
