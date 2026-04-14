const router = require('express').Router();
const { Photo } = require('../models');
const sharp = require('sharp');
const { getObjectBuffer, putObject } = require('./s3.service');
const { requireAuth } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

router.use(requireAuth);

/**
 * POST /api/v1/photos/:id/crop
 * Crop a photo
 */
router.post('/:id/crop', async (req, res) => {
  try {
    const { x, y, width, height } = req.body;

    if (!x || !y || !width || !height) {
      return res.status(400).json({ error: 'x, y, width, height are required' });
    }

    const photo = await Photo.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Get original photo
    const photoBuffer = await getObjectBuffer(photo.s3_key_original);

    // Apply crop
    const croppedImage = await sharp(photoBuffer)
      .extract({ left: Math.round(x), top: Math.round(y), width: Math.round(width), height: Math.round(height) })
      .toBuffer();

    // Generate new S3 key
    const newS3Key = photo.s3_key_original.replace(/\.[^.]+$/, `-crop-${Date.now()}.jpg`);

    // Upload cropped version
    await putObject(newS3Key, croppedImage, 'image/jpeg');

    // Update photo with edit history
    const editHistory = photo.edit_history ? JSON.parse(photo.edit_history) : [];
    editHistory.push({
      type: 'crop',
      params: { x, y, width, height },
      applied_at: new Date(),
      s3_key: newS3Key,
    });

    await photo.update({
      s3_key_original: newS3Key,
      edit_history: JSON.stringify(editHistory),
    });

    res.json({ success: true, message: 'Photo cropped successfully', photo });
  } catch (error) {
    logger.error('Error cropping photo:', error);
    res.status(500).json({ error: 'Failed to crop photo' });
  }
});

/**
 * POST /api/v1/photos/:id/rotate
 * Rotate a photo
 */
router.post('/:id/rotate', async (req, res) => {
  try {
    const { degrees } = req.body;

    if (!degrees || ![90, 180, 270].includes(degrees)) {
      return res.status(400).json({ error: 'degrees must be 90, 180, or 270' });
    }

    const photo = await Photo.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Get original photo
    const photoBuffer = await getObjectBuffer(photo.s3_key_original);

    // Apply rotation
    const rotatedImage = await sharp(photoBuffer)
      .rotate(degrees)
      .toBuffer();

    // Generate new S3 key
    const newS3Key = photo.s3_key_original.replace(/\.[^.]+$/, `-rotate-${Date.now()}.jpg`);

    // Upload rotated version
    await putObject(newS3Key, rotatedImage, 'image/jpeg');

    // Update photo with edit history
    const editHistory = photo.edit_history ? JSON.parse(photo.edit_history) : [];
    editHistory.push({
      type: 'rotate',
      params: { degrees },
      applied_at: new Date(),
      s3_key: newS3Key,
    });

    await photo.update({
      s3_key_original: newS3Key,
      edit_history: JSON.stringify(editHistory),
    });

    res.json({ success: true, message: 'Photo rotated successfully', photo });
  } catch (error) {
    logger.error('Error rotating photo:', error);
    res.status(500).json({ error: 'Failed to rotate photo' });
  }
});

/**
 * POST /api/v1/photos/:id/adjust
 * Adjust brightness and contrast
 */
router.post('/:id/adjust', async (req, res) => {
  try {
    const { brightness = 0, contrast = 0 } = req.body;

    // Validate ranges (-100 to +100)
    if (brightness < -100 || brightness > 100 || contrast < -100 || contrast > 100) {
      return res.status(400).json({ error: 'brightness and contrast must be between -100 and 100' });
    }

    const photo = await Photo.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Get original photo
    let image = await getObjectBuffer(photo.s3_key_original);
    image = sharp(image);

    // Apply brightness adjustment (convert -100..100 to 0.5..1.5)
    if (brightness !== 0) {
      const brightnessMultiplier = 1 + brightness / 200; // -100 = 0.5, +100 = 1.5
      image = image.modulate({ brightness: brightnessMultiplier });
    }

    // Apply contrast adjustment
    if (contrast !== 0) {
      image = image.normalise(); // Simple contrast enhancement
    }

    const adjustedImage = await image.toBuffer();

    // Generate new S3 key
    const newS3Key = photo.s3_key_original.replace(/\.[^.]+$/, `-adjust-${Date.now()}.jpg`);

    // Upload adjusted version
    await putObject(newS3Key, adjustedImage, 'image/jpeg');

    // Update photo with edit history
    const editHistory = photo.edit_history ? JSON.parse(photo.edit_history) : [];
    editHistory.push({
      type: 'adjust',
      params: { brightness, contrast },
      applied_at: new Date(),
      s3_key: newS3Key,
    });

    await photo.update({
      s3_key_original: newS3Key,
      edit_history: JSON.stringify(editHistory),
    });

    res.json({ success: true, message: 'Photo adjusted successfully', photo });
  } catch (error) {
    logger.error('Error adjusting photo:', error);
    res.status(500).json({ error: 'Failed to adjust photo' });
  }
});

/**
 * GET /api/v1/photos/:id/edit-history
 * Get edit history of a photo
 */
router.get('/:id/edit-history', async (req, res) => {
  try {
    const photo = await Photo.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    const editHistory = photo.edit_history ? JSON.parse(photo.edit_history) : [];
    res.json({ edits: editHistory });
  } catch (error) {
    logger.error('Error fetching edit history:', error);
    res.status(500).json({ error: 'Failed to fetch edit history' });
  }
});

/**
 * POST /api/v1/photos/:id/undo-edit
 * Undo the last edit (restore from history)
 */
router.post('/:id/undo-edit', async (req, res) => {
  try {
    const photo = await Photo.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    const editHistory = photo.edit_history ? JSON.parse(photo.edit_history) : [];

    if (editHistory.length === 0) {
      return res.status(400).json({ error: 'No edits to undo' });
    }

    // Remove last edit
    const lastEdit = editHistory.pop();

    // Restore to previous version or original
    let previousS3Key = photo.original_s3_key;

    if (editHistory.length > 0) {
      previousS3Key = editHistory[editHistory.length - 1].s3_key;
    }

    await photo.update({
      s3_key_original: previousS3Key,
      edit_history: editHistory.length > 0 ? JSON.stringify(editHistory) : null,
    });

    res.json({ success: true, message: 'Edit undone successfully', photo });
  } catch (error) {
    logger.error('Error undoing edit:', error);
    res.status(500).json({ error: 'Failed to undo edit' });
  }
});

module.exports = router;
