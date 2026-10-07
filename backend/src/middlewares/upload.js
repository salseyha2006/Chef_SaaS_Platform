const multer = require('multer');
const ApiError = require('../utils/ApiError');

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        ApiError.badRequest('Only JPG, PNG or WEBP images are allowed', [], {
          code: 'AVATAR_INVALID_TYPE',
        })
      );
    }
    cb(null, true);
  },
});

function handleAvatarUpload(req, res, next) {
  upload.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          ApiError.badRequest('Image must be 5MB or smaller', [], { code: 'AVATAR_TOO_LARGE' })
        );
      }
      return next(ApiError.badRequest(err.message, [], { code: 'AVATAR_UPLOAD_ERROR' }));
    }
    if (err) return next(err);
    next();
  });
}

module.exports = { handleAvatarUpload, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES };
