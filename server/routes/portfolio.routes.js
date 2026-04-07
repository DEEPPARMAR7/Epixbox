const router = require('express').Router();
const { User, Gallery, Photo, Tag } = require('../models/index');
const { getPublicUrl } = require('../services/s3.service');
const { Op } = require('sequelize');
const { setPublicCache } = require('../middleware/cache.middleware');

// Attach public URLs to a photo plain object
function withPhotoUrls(photo) {
  const p = photo.toJSON ? photo.toJSON() : { ...photo };
  p.thumb_url = getPublicUrl(p.s3_key_thumb);
  p.medium_url = getPublicUrl(p.s3_key_medium);
  p.large_url = getPublicUrl(p.s3_key_large);
  return p;
}

function withGalleryUrls(gallery) {
  const g = gallery.toJSON ? gallery.toJSON() : { ...gallery };
  if (g.coverPhoto) {
    g.cover_url = getPublicUrl(g.coverPhoto.s3_key_medium || g.coverPhoto.s3_key_thumb);
  }
  return g;
}

// GET /api/portfolio/:username
router.get('/:username', setPublicCache, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username.toLowerCase(), is_active: true },
      attributes: ['id', 'username', 'first_name', 'last_name', 'bio', 'avatar_url', 'website_url', 'brand_name', 'brand_logo_url', 'brand_color'],
    });
    if (!user) return res.status(404).json({ error: 'Photographer not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolio/:username/galleries
router.get('/:username/galleries', setPublicCache, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { username: req.params.username.toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'Photographer not found' });

    const galleries = await Gallery.findAll({
      where: { user_id: user.id, visibility: 'public' },
      include: [{ model: Photo, as: 'coverPhoto', attributes: ['id', 's3_key_thumb', 's3_key_medium'], required: false }],
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
    });
    res.json(galleries.map(withGalleryUrls));
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolio/:username/galleries/:slug
router.get('/:username/galleries/:slug', setPublicCache, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { username: req.params.username.toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'Photographer not found' });

    const gallery = await Gallery.findOne({
      where: { user_id: user.id, slug: req.params.slug, visibility: { [Op.in]: ['public', 'unlisted'] } },
    });
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    const photos = await Photo.findAll({
      where: { gallery_id: gallery.id },
      include: [{ model: Tag, through: { attributes: [] } }],
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
    });
    res.json({ gallery, photos: photos.map(withPhotoUrls) });
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolio/:username/photos/:id
router.get('/:username/photos/:id', setPublicCache, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { username: req.params.username.toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'Photographer not found' });

    const photo = await Photo.findOne({
      where: { id: req.params.id, user_id: user.id },
      include: [
        { model: Gallery, where: { visibility: 'public' }, required: true },
        { model: Tag, through: { attributes: [] } },
      ],
    });
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    res.json(withPhotoUrls(photo));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
