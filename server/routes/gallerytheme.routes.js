const router = require('express').Router();
const { Gallery, GallerySetting } = require('../models');
const { requireAuth } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

router.use(requireAuth);

/**
 * POST /api/v1/galleries/:id/apply-theme
 * Apply a theme to a gallery
 */
router.post('/:id/apply-theme', async (req, res) => {
  try {
    const { theme_id } = req.body;

    if (!theme_id) {
      return res.status(400).json({ error: 'theme_id is required' });
    }

    const gallery = await Gallery.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: ['settings'],
    });

    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    // Update or create settings
    let settings = gallery.settings;
    if (!settings) {
      settings = await GallerySetting.create({
        gallery_id: gallery.id,
      });
    }

    // Store theme in appearance settings
    const appearance = settings.appearance || {};
    appearance.theme_id = theme_id;

    await settings.update({ appearance });

    res.json({ success: true, message: 'Theme applied successfully', gallery });
  } catch (error) {
    logger.error('Error applying theme:', error);
    res.status(500).json({ error: 'Failed to apply theme' });
  }
});

/**
 * PUT /api/v1/galleries/:id/custom-css
 * Save custom CSS for a gallery
 */
router.put('/:id/custom-css', async (req, res) => {
  try {
    const { css } = req.body;

    const gallery = await Gallery.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: ['settings'],
    });

    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    let settings = gallery.settings;
    if (!settings) {
      settings = await GallerySetting.create({
        gallery_id: gallery.id,
      });
    }

    const appearance = settings.appearance || {};
    appearance.custom_css = css;

    await settings.update({ appearance });

    res.json({ success: true, message: 'Custom CSS saved', gallery });
  } catch (error) {
    logger.error('Error saving custom CSS:', error);
    res.status(500).json({ error: 'Failed to save custom CSS' });
  }
});

/**
 * PUT /api/v1/galleries/:id/layout
 * Set gallery layout type
 */
router.put('/:id/layout', async (req, res) => {
  try {
    const { layout_type, layout_options } = req.body;

    if (!layout_type) {
      return res.status(400).json({ error: 'layout_type is required' });
    }

    const gallery = await Gallery.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: ['settings'],
    });

    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    let settings = gallery.settings;
    if (!settings) {
      settings = await GallerySetting.create({
        gallery_id: gallery.id,
      });
    }

    const appearance = settings.appearance || {};
    appearance.layout_type = layout_type;
    if (layout_options) {
      appearance.layout_options = layout_options;
    }

    await settings.update({ appearance });

    res.json({ success: true, message: 'Layout updated', gallery });
  } catch (error) {
    logger.error('Error updating layout:', error);
    res.status(500).json({ error: 'Failed to update layout' });
  }
});

module.exports = router;
