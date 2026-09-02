const multer = require('multer');
const path = require('path');

// Use in-memory buffer storage for direct streaming to Cloudinary
const storage = multer.memoryStorage();

// File validation for photography formats
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only photography image files (JPEG, PNG, WebP, GIF) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter: fileFilter,
});

module.exports = upload;
