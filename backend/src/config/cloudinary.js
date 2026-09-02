const cloudinary = require('cloudinary').v2;

// Configure Cloudinary SDK with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

/**
 * Check if Cloudinary credentials are provided in environment
 */
const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Upload a file buffer stream to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {Object} options - Options such as folder ('framora/posts', 'framora/avatars', 'framora/covers')
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadStreamToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.'
        )
      );
    }

    const uploadOptions = {
      folder: options.folder || 'framora/uploads',
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]:', error.message);
          return reject(new Error(`Image upload failed: ${error.message}`));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
        });
      }
    );

    stream.end(buffer);
  });
};

/**
 * Safely delete an asset from Cloudinary by public ID
 * @param {string} publicId - Cloudinary asset public ID
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.warn(`[Cloudinary Cleanup Warning]: Failed to delete asset ${publicId}:`, error.message);
    return null;
  }
};

/**
 * Generate a web-optimized public preview URL
 * @param {string} publicId - Cloudinary public ID
 * @param {string} fallbackUrl - Fallback URL if Cloudinary is not configured or external image
 * @returns {string}
 */
const generatePreviewUrl = (publicId, fallbackUrl) => {
  if (publicId && isCloudinaryConfigured()) {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [
        { width: 1600, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });
  }
  return fallbackUrl;
};

/**
 * Generate an authorized high-resolution master asset download URL
 * @param {string} publicId - Cloudinary public ID
 * @param {string} fallbackUrl - Fallback URL if Cloudinary is not configured or external image
 * @param {string} cleanTitle - Sanitized title for file download disposition
 * @returns {string}
 */
const generateDownloadUrl = (publicId, fallbackUrl, cleanTitle = 'framora_photo') => {
  if (publicId && isCloudinaryConfigured()) {
    return cloudinary.url(publicId, {
      secure: true,
      flags: `attachment:${cleanTitle}`,
      quality: '100',
    });
  }
  return fallbackUrl;
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadStreamToCloudinary,
  deleteFromCloudinary,
  generatePreviewUrl,
  generateDownloadUrl,
};
