const router = require('express').Router();
const slugify = require('slugify');
const { Photo, Tag, PhotoTag, Gallery } = require('../models/index');
const { deleteFile, getPublicUrl, getSignedViewUrl } = require('../services/s3.service');
const requireAuth = require('../middleware/auth.middleware');
const { Op } = require('sequelize');

router.use(requireAuth);

async function withUrls(photo) {
  const p = photo.toJSON ? photo.toJSON() : { ...photo };
  p.original_url = getPublicUrl(p.s3_key_original) || null;
  p.thumb_url  = getPublicUrl(p.s3_key_thumb)  || null;
  p.medium_url = getPublicUrl(p.s3_key_medium) || null;
  p.large_url  = getPublicUrl(p.s3_key_large)  || null;
  const preferredKey = p.s3_key_thumb || p.s3_key_medium || p.s3_key_large || p.s3_key_original;
  try {
    p.display_url = preferredKey ? await getSignedViewUrl(preferredKey, 3600) : null;
  } catch {
    p.display_url = p.thumb_url || p.medium_url || p.large_url || p.original_url;
  }
  return p;
}

// GET /api/photos
router.get('/', async (req, res, next) => {
  try {
    const { galleryId, page = 1, limit = 50 } = req.query;
    const where = { user_id: req.user.id };
    if (galleryId) where.gallery_id = galleryId;
    const photos = await Photo.findAll({
      where,
      include: [{ model: Tag, through: { attributes: [] } }],
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json(await Promise.all(photos.map(withUrls)));
  } catch (err) {
    next(err);
  }
});

// GET /api/photos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const photo = await Photo.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: Tag, through: { attributes: [] } }],
    });
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    res.json(await withUrls(photo));
  } catch (err) {
    next(err);
  }
});

// PUT /api/photos/:id
router.put('/:id', async (req, res, next) => {
  try {
    const photo = await Photo.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    const { title, description } = req.body;
    await photo.update({ title, description });
    res.json(await withUrls(photo));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/photos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const photo = await Photo.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    const keys = [photo.s3_key_original, photo.s3_key_large, photo.s3_key_medium, photo.s3_key_thumb].filter(Boolean);
    for (const key of keys) {
      try { await deleteFile(key); } catch {}
    }
    // Decrement gallery photo count
    await Gallery.decrement('photos_count', { where: { id: photo.gallery_id } });
    await photo.destroy();
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/photos/:id/tags
router.post('/:id/tags', async (req, res, next) => {
  try {
    const photo = await Photo.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    const { tags } = req.body; // array of tag names
    for (const name of tags) {
      const slug = slugify(name, { lower: true, strict: true });
      let [tag] = await Tag.findOrCreate({ where: { user_id: req.user.id, slug }, defaults: { name, slug, user_id: req.user.id } });
      await PhotoTag.findOrCreate({ where: { photo_id: photo.id, tag_id: tag.id } });
    }
    const updatedPhoto = await Photo.findByPk(photo.id, { include: [{ model: Tag, through: { attributes: [] } }] });
    res.json(updatedPhoto);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/photos/:id/tags/:tagId
router.delete('/:id/tags/:tagId', async (req, res, next) => {
  try {
    await PhotoTag.destroy({ where: { photo_id: req.params.id, tag_id: req.params.tagId } });
    res.json({ message: 'Tag removed' });
  } catch (err) {
    next(err);
  }
});

// POST /api/photos/bulk-delete
router.post('/bulk-delete', async (req, res, next) => {
  try {
    const { ids } = req.body;
    const photos = await Photo.findAll({ where: { id: ids, user_id: req.user.id } });
    for (const photo of photos) {
      const keys = [photo.s3_key_original, photo.s3_key_large, photo.s3_key_medium, photo.s3_key_thumb].filter(Boolean);
      for (const key of keys) { try { await deleteFile(key); } catch {} }
      await photo.destroy();
    }
    res.json({ message: `${photos.length} photos deleted` });
  } catch (err) {
    next(err);
  }
});

// POST /api/photos/bulk-move
router.post('/bulk-move', async (req, res, next) => {
  try {
    const { ids, galleryId } = req.body;
    const gallery = await Gallery.findOne({ where: { id: galleryId, user_id: req.user.id } });
    if (!gallery) return res.status(404).json({ error: 'Target gallery not found' });
    await Photo.update({ gallery_id: galleryId }, { where: { id: ids, user_id: req.user.id } });
    res.json({ message: `${ids.length} photos moved` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
