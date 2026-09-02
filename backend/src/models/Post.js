const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post must belong to a user'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [2000, 'Caption cannot exceed 2000 characters'],
      default: '',
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL or photo file is required'],
    },
    imagePublicId: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
      maxlength: [120, 'Location cannot exceed 120 characters'],
    },
    camera: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Camera info cannot exceed 100 characters'],
    },
    lens: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Lens info cannot exceed 100 characters'],
    },
    focalLength: {
      type: String,
      trim: true,
      default: '',
    },
    aperture: {
      type: String,
      trim: true,
      default: '',
    },
    shutterSpeed: {
      type: String,
      trim: true,
      default: '',
    },
    iso: {
      type: String,
      trim: true,
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
    },
    // Marketplace 1-of-1 Digital Asset Fields
    saleStatus: {
      type: String,
      enum: ['NOT_FOR_SALE', 'FOR_SALE', 'PAYMENT_PENDING', 'SOLD'],
      default: 'NOT_FOR_SALE',
      index: true,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price must be greater than or equal to 0'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true,
    },
    licenseInfo: {
      type: String,
      default: 'Standard 1-of-1 Digital Asset & Commercial License',
      trim: true,
      maxlength: [500, 'License info cannot exceed 500 characters'],
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    soldAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for comments
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
});

// Virtual for previewUrl
postSchema.virtual('previewUrl').get(function () {
  const { generatePreviewUrl } = require('../config/cloudinary');
  return generatePreviewUrl(this.imagePublicId, this.imageUrl);
});

// Index for search optimization
postSchema.index({ title: 'text', caption: 'text', location: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);
