const express = require('express');
const bcrypt = require('bcryptjs');
const { Gallery, GalleryPassword, GalleryExpiry } = require('../models');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

// SET gallery password
router.patch('/:galleryId/password', requireAuth, async (req, res, next) => {
  try {
    const { password, hint } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    const gallery = await Gallery.findOne({
      where: { id: req.params.galleryId, user_id: req.user.id },
    });

    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    let galleryPassword = await GalleryPassword.findOne({
      where: { gallery_id: gallery.id },
    });

    if (galleryPassword) {
      await galleryPassword.update({ password_hash, hint });
    } else {
      galleryPassword = await GalleryPassword.create({
        gallery_id: gallery.id,
        password_hash,
        hint,
      });
    }

    res.json({ message: 'Gallery password set', hint: hint || undefined });
  } catch (error) {
    next(error);
  }
});

// REMOVE gallery password
router.delete('/:galleryId/password', requireAuth, async (req, res, next) => {
  try {
    const gallery = await Gallery.findOne({
      where: { id: req.params.galleryId, user_id: req.user.id },
    });

    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    await GalleryPassword.destroy({
      where: { gallery_id: gallery.id },
    });

    res.json({ message: 'Gallery password removed' });
  } catch (error) {
    next(error);
  }
});

// SET gallery expiry
router.patch('/:galleryId/expiry', requireAuth, async (req, res, next) => {
  try {
    const { expires_at, download_limit } = req.body;

    if (!expires_at) {
      return res.status(400).json({ error: 'Expiry date required' });
    }

    const gallery = await Gallery.findOne({
      where: { id: req.params.galleryId, user_id: req.user.id },
    });

    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    let galleryExpiry = await GalleryExpiry.findOne({
      where: { gallery_id: gallery.id },
    });

    if (galleryExpiry) {
      await galleryExpiry.update({
        expires_at,
        download_limit,
        downloads_remaining: download_limit,
      });
    } else {
      galleryExpiry = await GalleryExpiry.create({
        gallery_id: gallery.id,
        expires_at,
        download_limit,
        downloads_remaining: download_limit,
      });
    }

    res.json(galleryExpiry);
  } catch (error) {
    next(error);
  }
});

// REMOVE gallery expiry
router.delete('/:galleryId/expiry', requireAuth, async (req, res, next) => {
  try {
    const gallery = await Gallery.findOne({
      where: { id: req.params.galleryId, user_id: req.user.id },
    });

    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    await GalleryExpiry.destroy({
      where: { gallery_id: gallery.id },
    });

    res.json({ message: 'Gallery expiry removed' });
  } catch (error) {
    next(error);
  }
});

// GET gallery access config
router.get('/:galleryId/access', requireAuth, async (req, res, next) => {
  try {
    const gallery = await Gallery.findOne({
      where: { id: req.params.galleryId, user_id: req.user.id },
      include: [
        { model: GalleryPassword, attributes: ['hint', 'is_enabled', 'updated_at'] },
        { model: GalleryExpiry, attributes: ['expires_at', 'download_limit', 'downloads_remaining'] },
      ],
    });

    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    res.json({
      gallery_id: gallery.id,
      password_protected: gallery.GalleryPassword ? gallery.GalleryPassword.is_enabled : false,
      password_hint: gallery.GalleryPassword?.hint,
      expiry_date: gallery.GalleryExpiry?.expires_at,
      download_limit: gallery.GalleryExpiry?.download_limit,
      downloads_remaining: gallery.GalleryExpiry?.downloads_remaining,
    });
  } catch (error) {
    next(error);
  }
});

// VERIFY password for public gallery
router.post('/:galleryId/verify-password', async (req, res, next) => {
  try {
    const { password } = req.body;

    const galleryPassword = await GalleryPassword.findOne({
      include: [
        {
          model: Gallery,
          where: { id: req.params.galleryId },
          attributes: ['id'],
        },
      ],
    });

    if (!galleryPassword || !galleryPassword.is_enabled) {
      return res.status(400).json({ error: 'No password set' });
    }

    const isMatch = await bcrypt.compare(password, galleryPassword.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Return a token that client can use to access gallery
    res.json({
      message: 'Password correct',
      access_token: Buffer.from(`gallery-${req.params.galleryId}-access`).toString('base64'),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
