const router = require('express').Router();
const slugify = require('slugify');
const { Gallery, GallerySetting, Photo } = require('../models/index');
const { deleteFile } = require('../services/s3.service');
const requireAuth = require('../middleware/auth.middleware');
const { Op } = require('sequelize');

router.use(requireAuth);

// GET /api/galleries
router.get('/', async (req, res, next) => {
  try {
    const galleries = await Gallery.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Photo, as: 'coverPhoto', attributes: ['id', 's3_key_thumb'], required: false },
        { model: GallerySetting, as: 'settings', required: false },
      ],
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
    });
    res.json(galleries);
  } catch (err) {
    next(err);
  }
});

// POST /api/galleries
router.post('/', async (req, res, next) => {
  try {
    const { title, description, visibility, parent_id, settings } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    let slug = slugify(title, { lower: true, strict: true });
    // Ensure unique slug for this user
    const existing = await Gallery.findOne({ where: { user_id: req.user.id, slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const gallery = await Gallery.create({
      user_id: req.user.id,
      title,
      slug,
      description,
      visibility: visibility || 'public',
      parent_id: parent_id || null,
    });

    if (settings && typeof settings === 'object') {
      await GallerySetting.create({
        gallery_id: gallery.id,
        preset: settings.preset || 'smugmug_settings',
        basics: settings.basics || {},
        security_sharing: settings.security_sharing || {},
        photo_protection: settings.photo_protection || {},
        social: settings.social || {},
        selling: settings.selling || {},
        appearance: settings.appearance || {},
      });
    }

    const created = await Gallery.findOne({
      where: { id: gallery.id, user_id: req.user.id },
      include: [{ model: GallerySetting, as: 'settings', required: false }],
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// GET /api/galleries/:id
router.get('/:id', async (req, res, next) => {
  try {
    const gallery = await Gallery.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        { model: Photo, as: 'coverPhoto', attributes: ['id', 's3_key_thumb'], required: false },
        { model: GallerySetting, as: 'settings', required: false },
      ],
    });
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });
    res.json(gallery);
  } catch (err) {
    next(err);
  }
});

// PUT /api/galleries/:id
router.put('/:id', async (req, res, next) => {
  try {
    const gallery = await Gallery.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });
    const { title, description, visibility, parent_id, sort_order, settings } = req.body;
    await gallery.update({ title, description, visibility, parent_id, sort_order });

    if (settings && typeof settings === 'object') {
      const existingSettings = await GallerySetting.findOne({ where: { gallery_id: gallery.id } });
      const payload = {
        preset: settings.preset || 'smugmug_settings',
        basics: settings.basics || {},
        security_sharing: settings.security_sharing || {},
        photo_protection: settings.photo_protection || {},
        social: settings.social || {},
        selling: settings.selling || {},
        appearance: settings.appearance || {},
      };

      if (existingSettings) {
        await existingSettings.update(payload);
      } else {
        await GallerySetting.create({ gallery_id: gallery.id, ...payload });
      }
    }

    const updated = await Gallery.findOne({
      where: { id: gallery.id, user_id: req.user.id },
      include: [{ model: GallerySetting, as: 'settings', required: false }],
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/galleries/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const gallery = await Gallery.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: Photo }],
    });
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    // Delete all photos from S3
    for (const photo of gallery.Photos || []) {
      const keys = [photo.s3_key_original, photo.s3_key_large, photo.s3_key_medium, photo.s3_key_thumb].filter(Boolean);
      for (const key of keys) {
        try { await deleteFile(key); } catch {}
      }
    }

    await gallery.destroy();
    res.json({ message: 'Gallery deleted' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/galleries/:id/cover
router.patch('/:id/cover', async (req, res, next) => {
  try {
    const gallery = await Gallery.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });
    await gallery.update({ cover_photo_id: req.body.photoId });
    res.json(gallery);
  } catch (err) {
    next(err);
  }
});

// PUT /api/galleries/:id/visibility
router.put('/:id/visibility', async (req, res, next) => {
  try {
    const gallery = await Gallery.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });
    const { visibility } = req.body;
    if (!['public', 'private', 'unlisted'].includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility value' });
    }
    await gallery.update({ visibility });
    res.json(gallery);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
