const router = require('express').Router();
const { User, Gallery, Photo, Tag, GalleryExpiry, GalleryPassword, GallerySetting } = require('../models/index');
const { getPublicUrl } = require('../services/s3.service');
const { Op } = require('sequelize');
const { setPublicCache } = require('../middleware/cache.middleware');
const { getTierLimits } = require('../utils/subscriptionTiers');

function isGalleryExpired(expiry) {
  if (!expiry || expiry.is_enabled === false) return false;
  if (!expiry.expires_at) return false;
  return new Date(expiry.expires_at).getTime() <= Date.now();
}

function expectedGalleryAccessToken(galleryId) {
  return Buffer.from(`gallery-${galleryId}-access`).toString('base64');
}

function readGalleryAccessToken(req) {
  const headerToken = req.headers['x-gallery-access-token'];
  if (headerToken) return String(headerToken).trim();
  const queryToken = req.query.access_token;
  return queryToken ? String(queryToken).trim() : '';
}

function requireGalleryPasswordAccess(req, res, gallery) {
  const password = gallery.GalleryPassword;
  if (!password || password.is_enabled === false) return false;

  const providedToken = readGalleryAccessToken(req);
  const expectedToken = expectedGalleryAccessToken(gallery.id);
  if (providedToken === expectedToken) return false;

  res.status(401).json({
    error: 'This gallery is password protected',
    needs_password: true,
    gallery_id: gallery.id,
    hint: password.hint || null,
  });
  return true;
}

// Portfolios are always public now
function requirePublicPortfolioEnabled(res, user) {
  return false;
}

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
    const coverPhoto = g.coverPhoto.toJSON ? g.coverPhoto.toJSON() : g.coverPhoto;
    g.cover_url = getPublicUrl(coverPhoto.s3_key_medium || coverPhoto.s3_key_thumb);
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
    if (requirePublicPortfolioEnabled(res, user)) return;
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
    if (requirePublicPortfolioEnabled(res, user)) return;

    const galleries = await Gallery.findAll({
      where: { user_id: user.id, visibility: 'public' },
      include: [
        { model: Photo, as: 'coverPhoto', attributes: ['id', 's3_key_thumb', 's3_key_medium'], required: false },
        { model: GalleryExpiry, attributes: ['expires_at', 'is_enabled'], required: false },
      ],
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
    });

    const visibleGalleries = galleries
      .filter((gallery) => !isGalleryExpired(gallery.GalleryExpiry))
      .map(withGalleryUrls);

    res.json(visibleGalleries);
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolio/:username/galleries/:slug
router.get('/:username/galleries/:slug', setPublicCache, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { username: req.params.username.toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'Photographer not found' });
    if (requirePublicPortfolioEnabled(res, user)) return;

    const gallery = await Gallery.findOne({
      where: { user_id: user.id, slug: req.params.slug, visibility: { [Op.in]: ['public', 'unlisted'] } },
      include: [
        { model: GalleryExpiry, attributes: ['expires_at', 'is_enabled'], required: false },
        { model: GalleryPassword, attributes: ['gallery_id', 'hint', 'is_enabled'], required: false },
        { model: GallerySetting, as: 'settings', attributes: ['appearance'], required: false },
      ],
    });
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    if (isGalleryExpired(gallery.GalleryExpiry)) {
      return res.status(410).json({ error: 'Gallery has expired' });
    }

    if (requireGalleryPasswordAccess(req, res, gallery)) {
      return;
    }

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
    if (requirePublicPortfolioEnabled(res, user)) return;

    const photo = await Photo.findOne({
      where: { id: req.params.id, user_id: user.id },
      include: [
        {
          model: Gallery,
          where: { visibility: 'public' },
          include: [
            { model: GalleryExpiry, attributes: ['expires_at', 'is_enabled'], required: false },
            { model: GalleryPassword, attributes: ['gallery_id', 'hint', 'is_enabled'], required: false },
          ],
          required: true,
        },
        { model: Tag, through: { attributes: [] } },
      ],
    });
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    if (isGalleryExpired(photo.Gallery?.GalleryExpiry)) {
      return res.status(410).json({ error: 'Gallery has expired' });
    }

    if (requireGalleryPasswordAccess(req, res, photo.Gallery)) {
      return;
    }

    res.json(withPhotoUrls(photo));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
