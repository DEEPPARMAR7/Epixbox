const router = require('express').Router();
const { WatermarkTemplate } = require('../models');
const { applyWatermark } = require('../services/watermark.service');
const requireAuth = require('../middleware/auth.middleware');
const { Photo } = require('../models');
const logger = require('../config/logger');

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/v1/watermarks
 * Get all watermark templates for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const templates = await WatermarkTemplate.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.json(templates);
  } catch (error) {
    logger.error('Error fetching watermarks:', error);
    res.status(500).json({ error: 'Failed to fetch watermarks' });
  }
});

/**
 * GET /api/v1/watermarks/:id
 * Get a specific watermark template
 */
router.get('/:id', async (req, res) => {
  try {
    const template = await WatermarkTemplate.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!template) return res.status(404).json({ error: 'Watermark not found' });
    res.json(template);
  } catch (error) {
    logger.error('Error fetching watermark:', error);
    res.status(500).json({ error: 'Failed to fetch watermark' });
  }
});

/**
 * POST /api/v1/watermarks
 * Create a new watermark template
 */
router.post('/', async (req, res) => {
  try {
    const { name, position, opacity, size_percentage, font_family, text, color, rotation, is_text_watermark } = req.body;

    // Validate required fields
    if (!name || !text) {
      return res.status(400).json({ error: 'Name and text are required' });
    }

    const template = await WatermarkTemplate.create({
      user_id: req.user.id,
      name,
      position: position || 'bottom-right',
      opacity: opacity || 0.5,
      size_percentage: size_percentage || 20,
      font_family: font_family || 'Arial',
      text,
      color: color || '#FFFFFF',
      rotation: rotation || -45,
      is_text_watermark: is_text_watermark !== false,
    });

    res.status(201).json(template);
  } catch (error) {
    logger.error('Error creating watermark:', error);
    res.status(500).json({ error: 'Failed to create watermark' });
  }
});

/**
 * PUT /api/v1/watermarks/:id
 * Update a watermark template
 */
router.put('/:id', async (req, res) => {
  try {
    const template = await WatermarkTemplate.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!template) return res.status(404).json({ error: 'Watermark not found' });

    await template.update(req.body);
    res.json(template);
  } catch (error) {
    logger.error('Error updating watermark:', error);
    res.status(500).json({ error: 'Failed to update watermark' });
  }
});

/**
 * DELETE /api/v1/watermarks/:id
 * Delete a watermark template
 */
router.delete('/:id', async (req, res) => {
  try {
    const template = await WatermarkTemplate.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!template) return res.status(404).json({ error: 'Watermark not found' });

    await template.destroy();
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting watermark:', error);
    res.status(500).json({ error: 'Failed to delete watermark' });
  }
});

/**
 * POST /api/v1/watermarks/:id/apply-to-photo
 * Apply watermark to a specific photo
 */
router.post('/:id/apply-to-photo', async (req, res) => {
  try {
    const { photo_id } = req.body;

    if (!photo_id) {
      return res.status(400).json({ error: 'photo_id is required' });
    }

    // Verify watermark ownership
    const template = await WatermarkTemplate.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!template) return res.status(404).json({ error: 'Watermark not found' });

    // Verify photo ownership
    const photo = await Photo.findOne({
      where: { id: photo_id, user_id: req.user.id },
    });
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Apply watermark (async job - return immediately)
    applyWatermark(photo.s3_key_original, req.params.id)
      .then(async (newS3Key) => {
        // Update photo with watermarked version
        await photo.update({
          s3_key_original: newS3Key,
          edit_history: JSON.stringify([
            ...(photo.edit_history ? JSON.parse(photo.edit_history) : []),
            { type: 'watermark', watermark_id: req.params.id, applied_at: new Date() },
          ]),
        });
      })
      .catch((error) => {
        logger.error('Watermark application failed:', error);
      });

    res.json({ success: true, message: 'Watermark is being applied, this may take a few moments' });
  } catch (error) {
    logger.error('Error applying watermark:', error);
    res.status(500).json({ error: 'Failed to apply watermark' });
  }
});

/**
 * POST /api/v1/watermarks/apply-to-multiple
 * Apply watermark to multiple photos
 */
router.post('/apply-to-multiple', async (req, res) => {
  try {
    const { watermark_id, photo_ids } = req.body;

    if (!watermark_id || !photo_ids || !Array.isArray(photo_ids)) {
      return res.status(400).json({ error: 'watermark_id and photo_ids array are required' });
    }

    // Verify watermark ownership
    const template = await WatermarkTemplate.findOne({
      where: { id: watermark_id, user_id: req.user.id },
    });
    if (!template) return res.status(404).json({ error: 'Watermark not found' });

    // Verify photo ownership (all photos must belong to user)
    const photos = await Photo.findAll({
      where: { id: photo_ids, user_id: req.user.id },
    });
    if (photos.length !== photo_ids.length) {
      return res.status(403).json({ error: 'Some photos do not belong to you' });
    }

    // Queue watermark jobs (async)
    const jobs = photos.map((photo) =>
      applyWatermark(photo.s3_key_original, watermark_id)
        .then(async (newS3Key) => {
          await photo.update({
            s3_key_original: newS3Key,
            edit_history: JSON.stringify([
              ...(photo.edit_history ? JSON.parse(photo.edit_history) : []),
              { type: 'watermark', watermark_id, applied_at: new Date() },
            ]),
          });
        })
        .catch((error) => {
          logger.error(`Failed to watermark photo ${photo.id}:`, error);
        })
    );

    // Don't wait for jobs to complete, just queue them
    Promise.allSettled(jobs);

    res.json({ success: true, message: `Watermark is being applied to ${photos.length} photos` });
  } catch (error) {
    logger.error('Error applying watermarks:', error);
    res.status(500).json({ error: 'Failed to apply watermarks' });
  }
});

module.exports = router;
