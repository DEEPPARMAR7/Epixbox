const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { Photo, Gallery } = require('../models/index');
const { createUploadPhotos } = require('../middleware/upload.middleware');
const { getTierLimits } = require('../utils/subscriptionTiers');
const { processUploadedPhoto } = require('../services/imageProcess.service');
const { extractExif } = require('../services/exif.service');
const { getObjectBuffer, getSignedUploadUrl, getPublicUrl, deleteFile } = require('../services/s3.service');
const requireAuth = require('../middleware/auth.middleware');
const { uploadLimiter } = require('../middleware/rateLimit.middleware');
const { audit } = require('../middleware/audit.middleware');
const { sendUploadCompleteEmail } = require('../services/email.service');
const { pushUserNotification } = require('../services/realtime.service');

function withUrls(photo) {
  const p = photo.toJSON ? photo.toJSON() : { ...photo };
  p.thumb_url  = getPublicUrl(p.s3_key_thumb)  || null;
  p.medium_url = getPublicUrl(p.s3_key_medium) || null;
  p.large_url  = getPublicUrl(p.s3_key_large)  || null;
  return p;
}

router.use(requireAuth);
router.use(uploadLimiter);

// POST /api/upload/photos
router.post('/photos', audit('upload.photos'), (req, res, next) => {
  const limits = getTierLimits(req.user?.plan);
  const uploadPhotos = createUploadPhotos({
    maxFiles: limits.maxUploadBatch,
    maxFileSizeMb: limits.maxUploadFileSizeMb,
  });

  uploadPhotos(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: `File too large. Your ${limits.label} plan allows up to ${limits.maxUploadFileSizeMb}MB per file.`,
          code: 'FILE_TOO_LARGE',
          limits,
        });
      }

      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          error: `Too many files. Your ${limits.label} plan allows up to ${limits.maxUploadBatch} files per upload.`,
          code: 'TOO_MANY_FILES',
          limits,
        });
      }

      if (String(err.message || '').toLowerCase().includes('invalid file type')) {
        return res.status(400).json({
          error: err.message,
          code: 'INVALID_FILE_TYPE',
        });
      }

      return next(err);
    }
    try {
      const { gallery_id } = req.body;
      if (!gallery_id) return res.status(400).json({ error: 'gallery_id is required' });

      const incomingCount = (req.files || []).length;
      const currentPhotoCount = await Photo.count({ where: { user_id: req.user.id } });
      if (currentPhotoCount + incomingCount > limits.maxPhotosAccount) {
        for (const file of req.files || []) {
          try { await deleteFile(file.key); } catch {}
        }
        return res.status(403).json({
          error: `Your ${limits.label} plan allows up to ${limits.maxPhotosAccount} photos. Upgrade to continue.`,
          tier: limits.tier,
          limits,
        });
      }

      const gallery = await Gallery.findOne({ where: { id: gallery_id, user_id: req.user.id } });
      if (!gallery) {
        const firstGallery = await Gallery.findOne({
          where: { user_id: req.user.id },
          attributes: ['id'],
          order: [['created_at', 'DESC']],
        });

        if (firstGallery) {
          return res.status(409).json({
            error: 'Selected gallery does not belong to this account.',
            code: 'GALLERY_ACCOUNT_MISMATCH',
            firstGalleryId: firstGallery.id,
          });
        }

        return res.status(404).json({
          error: 'No gallery found for this account. Create a gallery first.',
          code: 'NO_GALLERY_FOR_ACCOUNT',
        });
      }

      const createdPhotos = [];

      for (const file of req.files || []) {
        const photoId = uuidv4();
        const s3KeyOriginal = file.key;

        // Extract EXIF
        let exifData = {};
        try {
          const buffer = await getObjectBuffer(s3KeyOriginal);
          exifData = await extractExif(buffer);
        } catch {}

        // Process thumbnails only for images.
        let processedKeys = {};
        if (String(file.mimetype || '').startsWith('image/')) {
          try {
            processedKeys = await processUploadedPhoto(s3KeyOriginal, req.user.id, gallery_id, photoId);
          } catch (procErr) {
            console.error('Image processing error:', procErr.message);
          }
        }

        const photo = await Photo.create({
          id: photoId,
          gallery_id,
          user_id: req.user.id,
          filename_original: file.originalname,
          s3_key_original: s3KeyOriginal,
          s3_key_large: processedKeys.s3KeyLarge || null,
          s3_key_medium: processedKeys.s3KeyMedium || null,
          s3_key_thumb: processedKeys.s3KeyThumb || null,
          width: processedKeys.width || null,
          height: processedKeys.height || null,
          file_size_bytes: file.size,
          mime_type: file.mimetype,
          exif_make: exifData.make,
          exif_model: exifData.model,
          exif_lens: exifData.lens,
          exif_focal_length: exifData.focalLength,
          exif_aperture: exifData.aperture,
          exif_shutter_speed: exifData.shutterSpeed,
          exif_iso: exifData.iso,
          exif_taken_at: exifData.takenAt,
          exif_gps_lat: exifData.gpsLat,
          exif_gps_lng: exifData.gpsLng,
        });

        await Gallery.increment('photos_count', { where: { id: gallery_id } });
        createdPhotos.push(photo);
      }

      if (String(process.env.ENABLE_UPLOAD_EMAIL_NOTIFICATIONS || 'false').toLowerCase() === 'true') {
        sendUploadCompleteEmail({
          to: req.user?.email,
          galleryTitle: gallery?.title,
          uploadedCount: createdPhotos.length,
        }).catch(() => {});
      }

      pushUserNotification(req.user.id, {
        type: 'upload.completed',
        title: 'Upload Completed',
        message: `${createdPhotos.length} file${createdPhotos.length === 1 ? '' : 's'} processed in ${gallery?.title || 'gallery'}`,
        galleryId: gallery_id,
      });

      res.status(201).json(createdPhotos.map(withUrls));
    } catch (err) {
      next(err);
    }
  });
});

// GET /api/upload/presign — get presigned S3 upload URL
router.get('/presign', audit('upload.presign'), async (req, res, next) => {
  try {
    const { filename, contentType, galleryId } = req.query;
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename and contentType required' });
    }
    const key = `${req.user.id}/${galleryId || 'ungrouped'}/${Date.now()}-${filename}`;
    const uploadUrl = await getSignedUploadUrl(key, contentType);
    res.json({ uploadUrl, key });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
