const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { User, Gallery, Photo, Tag, GalleryExpiry, GalleryPassword, GallerySetting } = require('../models/index');
const { getPublicUrl } = require('../services/s3.service');
const { Op, fn, col, where } = require('sequelize');
const { setPublicCache } = require('../middleware/cache.middleware');
const { getTierLimits } = require('../utils/subscriptionTiers');

async function findUserByUsername(username, options = {}) {
  const { activeOnly = false, ...queryOptions } = options;
  const normalized = String(username || '').trim().toLowerCase();
  const usernameCondition = where(fn('lower', col('username')), normalized);
  return User.findOne({
    where: activeOnly ? { [Op.and]: [usernameCondition, { is_active: true }] } : usernameCondition,
    ...queryOptions,
  });
}

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

function isMissingGalleryExpiryTableError(err) {
  const originalMsg = String(err?.original?.message || err?.parent?.message || err?.message || '');
  const code = err?.original?.code || err?.parent?.code || err?.code || null;
  if (typeof originalMsg === 'string' && /GalleryExpir/i.test(originalMsg)) {
    // Postgres missing relation uses code '42P01' but other dialects/contexts may vary.
    if (code === '42P01' || originalMsg.toLowerCase().includes('does not exist') || originalMsg.toLowerCase().includes('doesn\'t exist')) {
      return true;
    }
    return true; // still treat it as missing-expiry table when name appears in message
  }
  return false;
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
    const user = await findUserByUsername(req.params.username, {
      activeOnly: true,
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
    const user = await findUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: 'Photographer not found' });
    if (requirePublicPortfolioEnabled(res, user)) return;

    // Determine if the request is from the portfolio owner
    let isOwner = false;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me');
        if (decoded?.id) {
          const authenticatedUser = await User.findByPk(decoded.id, { attributes: ['id', 'username'] });
          if (authenticatedUser && authenticatedUser.username.toLowerCase() === user.username.toLowerCase()) {
            isOwner = true;
          }
        }
      } catch (e) {}
    }

    // If owner, show all galleries. Otherwise, only public.
    const where = { user_id: user.id };
    if (!isOwner) {
      where.visibility = 'public';
    }

    let galleries
    try {
      galleries = await Gallery.findAll({
        where,
        include: [
          { model: Photo, as: 'coverPhoto', attributes: ['id', 's3_key_thumb', 's3_key_medium'], required: false },
          { model: GalleryExpiry, attributes: ['expires_at', 'is_enabled'], required: false },
        ],
        order: [['sort_order', 'ASC'], ['createdAt', 'DESC']],
      });
    } catch (err) {
      if (isMissingGalleryExpiryTableError(err)) {
        galleries = await Gallery.findAll({
          where,
          include: [
            { model: Photo, as: 'coverPhoto', attributes: ['id', 's3_key_thumb', 's3_key_medium'], required: false },
          ],
          order: [['sort_order', 'ASC'], ['createdAt', 'DESC']],
        });
      } else {
        throw err;
      }
    }

    // For owner: show all, including expired. For others: filter out expired.
    const visibleGalleries = galleries
      .filter((gallery) => isOwner || !isGalleryExpired(gallery.GalleryExpiry))
      .map(withGalleryUrls);

    res.json(visibleGalleries);
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolio/:username/galleries/:slug
router.get('/:username/galleries/:slug', setPublicCache, async (req, res, next) => {
  try {
    const user = await findUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: 'Photographer not found' });
    if (requirePublicPortfolioEnabled(res, user)) return;

    let gallery
    try {
      gallery = await Gallery.findOne({
        where: { user_id: user.id, slug: req.params.slug, visibility: { [Op.in]: ['public', 'unlisted'] } },
        include: [
          { model: GalleryExpiry, attributes: ['expires_at', 'is_enabled'], required: false },
          { model: GalleryPassword, attributes: ['gallery_id', 'hint', 'is_enabled'], required: false },
          { model: GallerySetting, as: 'settings', attributes: ['appearance'], required: false },
        ],
      });
    } catch (err) {
      if (isMissingGalleryExpiryTableError(err)) {
        gallery = await Gallery.findOne({
          where: { user_id: user.id, slug: req.params.slug, visibility: { [Op.in]: ['public', 'unlisted'] } },
          include: [
            { model: GalleryPassword, attributes: ['gallery_id', 'hint', 'is_enabled'], required: false },
            { model: GallerySetting, as: 'settings', attributes: ['appearance'], required: false },
          ],
        });
      } else {
        throw err;
      }
    }
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
      order: [['sort_order', 'ASC'], ['createdAt', 'DESC']],
    });
    res.json({ gallery, photos: photos.map(withPhotoUrls) });
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolio/:username/photos/:id
router.get('/:username/photos/:id', setPublicCache, async (req, res, next) => {
  try {
    const user = await findUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: 'Photographer not found' });
    if (requirePublicPortfolioEnabled(res, user)) return;

    let photo
    try {
      photo = await Photo.findOne({
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
    } catch (err) {
      if (isMissingGalleryExpiryTableError(err)) {
        photo = await Photo.findOne({
          where: { id: req.params.id, user_id: user.id },
          include: [
            {
              model: Gallery,
              where: { visibility: 'public' },
              include: [
                { model: GalleryPassword, attributes: ['gallery_id', 'hint', 'is_enabled'], required: false },
              ],
              required: true,
            },
            { model: Tag, through: { attributes: [] } },
          ],
        });
      } else {
        throw err;
      }
    }
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
