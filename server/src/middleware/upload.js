const multer = require('multer');
const { storage } = require('../config/cloudinary');

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 5,
  },
});

const uploadImages = upload.array('images', 5);

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = 'Image upload error.';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Image size cannot exceed 5MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
      message = 'You can upload a maximum of 5 images.';
    }
    return res.status(400).json({
      success: false,
      message,
    });
  } else if (err) {
    if (err.statusCode === 502) {
      return next(err);
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'Error occurred during image upload.',
    });
  }
  next();
};

module.exports = {
  upload,
  uploadImages,
  handleUploadError,
};
