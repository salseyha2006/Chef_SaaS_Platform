const cloudinary = require('../config/cloudinary');

function uploadAvatarBuffer(buffer, chefId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'chef-saas/avatars',
        public_id: chefId,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 512, height: 512, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

module.exports = { uploadAvatarBuffer };
