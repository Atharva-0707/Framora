const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Purchase must have a buyer'],
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Purchase must have a seller'],
      index: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Purchase must be attached to a photo post'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Purchase amount is required'],
      min: [0, 'Amount must be greater than or equal to 0'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true,
    },
    razorpayOrderId: {
      type: String,
      required: [true, 'Razorpay order ID is required'],
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: '',
      index: true,
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['CREATED', 'PAYMENT_PENDING', 'PAID', 'FAILED', 'CANCELLED'],
      default: 'CREATED',
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user's purchased items efficiently
purchaseSchema.index({ buyer: 1, createdAt: -1 });
purchaseSchema.index({ seller: 1, createdAt: -1 });
purchaseSchema.index({ post: 1, status: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
