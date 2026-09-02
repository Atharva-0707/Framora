const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const {
  uploadStreamToCloudinary,
  deleteFromCloudinary,
  generatePreviewUrl,
} = require('../config/cloudinary');

// @desc    Get all posts (with search, filter, pagination, populate)
// @route   GET /api/posts
// @access  Public (Optional auth for isLiked/isBookmarked flags)
const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const { search, tag, location, filter, author, saleStatus } = req.query;

    const query = {};

    // Filter by author/user
    if (author) {
      query.user = author;
    }

    // Filter by saleStatus (e.g. FOR_SALE or SOLD)
    if (saleStatus) {
      query.saleStatus = saleStatus;
    }

    // Filter by tag
    if (tag) {
      query.tags = { $regex: new RegExp(`^${tag.trim()}$`, 'i') };
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Search query (matches title, caption, location, camera, lens, or tags)
    if (search) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { caption: searchRegex },
        { location: searchRegex },
        { camera: searchRegex },
        { lens: searchRegex },
        { tags: searchRegex },
      ];
    }

    // Following filter (only posts by creators the current user follows)
    if (filter === 'following' && req.user) {
      const currentUser = await User.findById(req.user._id);
      query.user = { $in: currentUser.following };
    }

    // Filter for marketplace tabs
    if (filter === 'for-sale') {
      query.saleStatus = 'FOR_SALE';
    } else if (filter === 'sold') {
      query.saleStatus = 'SOLD';
    }

    // Sort order
    let sort = { createdAt: -1 };
    if (filter === 'popular' || filter === 'trending') {
      sort = { 'likes.length': -1, createdAt: -1 };
    }

    const totalPosts = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('user', 'username name avatar bio')
      .populate('soldTo', 'username name avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Map like status & bookmark status if user is authenticated
    const currentUserId = req.user ? req.user._id.toString() : null;
    let userBookmarks = [];
    if (req.user) {
      const u = await User.findById(req.user._id).select('bookmarks');
      if (u) userBookmarks = u.bookmarks.map((b) => b.toString());
    }

    const formattedPosts = posts.map((post) => {
      const previewUrl = generatePreviewUrl(post.imagePublicId, post.imageUrl);
      return {
        ...post,
        imageUrl: previewUrl,
        previewUrl: previewUrl,
        likesCount: post.likes ? post.likes.length : 0,
        isLiked: currentUserId
          ? post.likes && post.likes.some((l) => l.toString() === currentUserId)
          : false,
        isBookmarked: currentUserId
          ? userBookmarks.includes(post._id.toString())
          : false,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedPosts.length,
      total: totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      posts: formattedPosts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username name avatar bio location website')
      .populate('soldTo', 'username name avatar')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Photography post not found',
      });
    }

    // Fetch comments
    const comments = await Comment.find({ post: post._id })
      .populate('user', 'username name avatar')
      .sort({ createdAt: -1 })
      .lean();

    const currentUserId = req.user ? req.user._id.toString() : null;
    let isBookmarked = false;
    if (req.user) {
      const u = await User.findById(req.user._id).select('bookmarks');
      if (u && u.bookmarks) {
        isBookmarked = u.bookmarks.some((b) => b.toString() === post._id.toString());
      }
    }

    const postOwnerId = post.user ? (post.user._id ? post.user._id.toString() : post.user.toString()) : null;
    const isOwner = currentUserId ? postOwnerId === currentUserId : false;
    const isPurchasedByCurrentUser = currentUserId && post.soldTo
      ? (post.soldTo._id ? post.soldTo._id.toString() : post.soldTo.toString()) === currentUserId
      : false;

    const previewUrl = generatePreviewUrl(post.imagePublicId, post.imageUrl);

    res.status(200).json({
      success: true,
      post: {
        ...post,
        imageUrl: previewUrl,
        previewUrl: previewUrl,
        likesCount: post.likes ? post.likes.length : 0,
        isLiked: currentUserId
          ? post.likes && post.likes.some((l) => l.toString() === currentUserId)
          : false,
        isBookmarked,
        isOwner,
        isPurchasedByCurrentUser,
        comments,
        commentsCount: comments.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const {
      title,
      caption,
      location,
      camera,
      lens,
      focalLength,
      aperture,
      shutterSpeed,
      iso,
      tags,
      imageUrl: directImageUrl,
    } = req.body;

    let finalImageUrl = directImageUrl;
    let imagePublicId = '';

    // Check if a file was uploaded via Multer
    if (req.file) {
      const uploadRes = await uploadStreamToCloudinary(req.file.buffer, {
        folder: 'framora/posts',
      });
      finalImageUrl = uploadRes.secure_url;
      imagePublicId = uploadRes.public_id;
    }

    if (!finalImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image for the photography post.',
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Post title is required.',
      });
    }

    // Process tags (can come as comma-separated string or array)
    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.map((t) => t.trim().toLowerCase().replace(/^#/, ''));
      } else if (typeof tags === 'string') {
        processedTags = tags
          .split(',')
          .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
          .filter(Boolean);
      }
    }

    const post = await Post.create({
      user: req.user._id,
      title: title.trim(),
      caption: caption ? caption.trim() : '',
      imageUrl: finalImageUrl,
      imagePublicId: imagePublicId,
      location: location ? location.trim() : '',
      camera: camera ? camera.trim() : '',
      lens: lens ? lens.trim() : '',
      focalLength: focalLength ? focalLength.trim() : '',
      aperture: aperture ? aperture.trim() : '',
      shutterSpeed: shutterSpeed ? shutterSpeed.trim() : '',
      iso: iso ? iso.trim() : '',
      tags: processedTags,
    });

    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'username name avatar'
    );

    res.status(201).json({
      success: true,
      message: 'Photo posted successfully!',
      post: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    // Check ownership
    if (
      post.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this post.',
      });
    }

    const {
      title,
      caption,
      location,
      camera,
      lens,
      focalLength,
      aperture,
      shutterSpeed,
      iso,
      tags,
    } = req.body;

    if (title) post.title = title.trim();
    if (caption !== undefined) post.caption = caption.trim();
    if (location !== undefined) post.location = location.trim();
    if (camera !== undefined) post.camera = camera.trim();
    if (lens !== undefined) post.lens = lens.trim();
    if (focalLength !== undefined) post.focalLength = focalLength.trim();
    if (aperture !== undefined) post.aperture = aperture.trim();
    if (shutterSpeed !== undefined) post.shutterSpeed = shutterSpeed.trim();
    if (iso !== undefined) post.iso = iso.trim();

    if (req.file) {
      const uploadRes = await uploadStreamToCloudinary(req.file.buffer, {
        folder: 'framora/posts',
      });
      // Delete previous Cloudinary asset if one existed
      if (post.imagePublicId) {
        await deleteFromCloudinary(post.imagePublicId);
      }
      post.imageUrl = uploadRes.secure_url;
      post.imagePublicId = uploadRes.public_id;
    }

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        post.tags = tags.map((t) => t.trim().toLowerCase().replace(/^#/, ''));
      } else if (typeof tags === 'string') {
        post.tags = tags
          .split(',')
          .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
          .filter(Boolean);
      }
    }

    const updatedPost = await post.save();
    const populated = await Post.findById(updatedPost._id).populate(
      'user',
      'username name avatar'
    );

    res.status(200).json({
      success: true,
      message: 'Post updated successfully!',
      post: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post & its comments
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    // Check ownership
    if (
      post.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post.',
      });
    }

    // Delete all comments associated with post
    await Comment.deleteMany({ post: post._id });

    // Remove post from bookmarks
    await User.updateMany(
      { bookmarks: post._id },
      { $pull: { bookmarks: post._id } }
    );

    // Delete Cloudinary asset if tracked
    if (post.imagePublicId) {
      await deleteFromCloudinary(post.imagePublicId);
    }

    await Post.findByIdAndDelete(post._id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Like / Unlike on a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const userId = req.user._id;
    const isLiked = post.likes.some((l) => l.toString() === userId.toString());

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter((l) => l.toString() !== userId.toString());
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      isLiked: !isLiked,
      likesCount: post.likes.length,
      message: !isLiked ? 'Liked post' : 'Unliked post',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Bookmark on a post
// @route   POST /api/posts/:id/bookmark
// @access  Private
const toggleBookmarkPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const user = await User.findById(req.user._id);
    const isBookmarked = user.bookmarks.some(
      (b) => b.toString() === post._id.toString()
    );

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(
        (b) => b.toString() !== post._id.toString()
      );
    } else {
      user.bookmarks.push(post._id);
    }

    await user.save();

    res.status(200).json({
      success: true,
      isBookmarked: !isBookmarked,
      bookmarksCount: user.bookmarks.length,
      message: !isBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sale settings for a post (Price, Currency, License, Status)
// @route   PUT /api/posts/:id/sale
// @access  Private (Owner only)
const updatePostSaleSettings = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    // Strict ownership check: Only the actual photographer/owner can configure its sale settings.
    // Admin role must NOT grant permission to list, price, or sell another user's photograph.
    const ownerId = post.user ? (post.user._id ? post.user._id.toString() : post.user.toString()) : '';
    if (ownerId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner of this photograph can manage its sale.',
      });
    }

    // A photo that is already SOLD cannot be reverted to for-sale or modified
    if (post.saleStatus === 'SOLD') {
      return res.status(400).json({
        success: false,
        message: 'This 1-of-1 photograph has already been sold and its ownership transferred.',
      });
    }

    const { saleStatus, price, currency, licenseInfo } = req.body;

    if (saleStatus) {
      if (!['NOT_FOR_SALE', 'FOR_SALE'].includes(saleStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sale status. Choose either FOR_SALE or NOT_FOR_SALE.',
        });
      }
      post.saleStatus = saleStatus;
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid non-negative price.',
        });
      }
      if (post.saleStatus === 'FOR_SALE' && numPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be at least ₹1 to list for sale.',
        });
      }
      post.price = numPrice;
    }

    if (currency) {
      post.currency = currency.toUpperCase().trim();
    }

    if (licenseInfo !== undefined) {
      post.licenseInfo = licenseInfo.trim();
    }

    await post.save();

    const populated = await Post.findById(post._id)
      .populate('user', 'username name avatar bio')
      .populate('soldTo', 'username name avatar');

    res.status(200).json({
      success: true,
      message:
        post.saleStatus === 'FOR_SALE'
          ? `Photograph successfully listed for sale at ₹${post.price}`
          : 'Photograph removed from marketplace',
      post: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  toggleBookmarkPost,
  updatePostSaleSettings,
};
