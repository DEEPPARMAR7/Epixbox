const multer = require('multer');
const multerS3 = require('multer-s3');
const s3Client = require('../config/s3');
const path = require('path');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff', 'image/heic'];

const storage = multerS3({
  s3: s3Client,
  bucket: process.env.S3_BUCKET_NAME || 'epicbox1',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    const userId = req.user ? req.user.id : 'unknown';
    const galleryId = req.body.gallery_id || 'ungrouped';
    const ext = path.extname(file.originalname).toLowerCase();
    const key = `${userId}/${galleryId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
    cb(null, key);
  },
});

const uploadPhotos = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only images are allowed.`));
    }
  },
}).array('photos', 50);

module.exports = { uploadPhotos };
