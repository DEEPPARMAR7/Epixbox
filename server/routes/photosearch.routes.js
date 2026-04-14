const router = require('express').Router();
const { Photo, Gallery, Tag } = require('../models');
const { Op } = require('sequelize');
const requireAuth = require('../middleware/auth.middleware');
const logger = require('../config/logger');

router.use(requireAuth);

/**
 * GET /api/v1/photos/search
 * Advanced photo search with filters
 */
router.get('/search', async (req, res) => {
  try {
    const {
      q, // search query
      gallery_id,
      dateFrom,
      dateTo,
      camera, // exif_make
      lens, // exif_lens
      iso, // exif_iso
      aperture, // exif_aperture
      focal_length, // exif_focal_length
      tags, // comma-separated tag IDs
      sort = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 20,
    } = req.query;

    const where = { user_id: req.user.id };
    const include = [];

    // Text search
    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ];
    }

    // Gallery filter
    if (gallery_id) {
      where.gallery_id = gallery_id;
    }

    // Date range
    if (dateFrom || dateTo) {
      where.exif_taken_at = {};
      if (dateFrom) where.exif_taken_at[Op.gte] = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.exif_taken_at[Op.lte] = endDate;
      }
    }

    // EXIF filters
    if (camera) where.exif_make = { [Op.like]: `%${camera}%` };
    if (lens) where.exif_lens = { [Op.like]: `%${lens}%` };
    if (iso) where.exif_iso = parseInt(iso);
    if (aperture) where.exif_aperture = aperture;
    if (focal_length) where.exif_focal_length = { [Op.like]: `%${focal_length}%` };

    // Tag filtering
    if (tags) {
      const tagIds = tags.split(',').filter(Boolean);
      include.push({
        model: Tag,
        where: { id: { [Op.in]: tagIds } },
        through: { attributes: [] },
      });
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Photo.findAndCountAll({
      where,
      include: include.length > 0 ? include : [],
      order: [[sort, order]],
      offset,
      limit: parseInt(limit),
    });

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit)),
      photos: rows,
    });
  } catch (error) {
    logger.error('Error searching photos:', error);
    res.status(500).json({ error: 'Failed to search photos' });
  }
});

/**
 * GET /api/v1/photos/filters/metadata
 * Get available EXIF metadata for filters (for dropdowns)
 */
router.get('/filters/metadata', async (req, res) => {
  try {
    const photos = await Photo.findAll({
      where: { user_id: req.user.id },
      attributes: [
        'exif_make',
        'exif_lens',
        'exif_iso',
        'exif_aperture',
        'exif_focal_length',
      ],
      raw: true,
    });

    // Extract unique values
    const metadata = {
      cameras: [...new Set(photos.map(p => p.exif_make).filter(Boolean))].sort(),
      lenses: [...new Set(photos.map(p => p.exif_lens).filter(Boolean))].sort(),
      isos: [...new Set(photos.map(p => p.exif_iso).filter(Boolean))].sort((a, b) => a - b),
      apertures: [...new Set(photos.map(p => p.exif_aperture).filter(Boolean))].sort(),
      focalLengths: [...new Set(photos.map(p => p.exif_focal_length).filter(Boolean))].sort(),
    };

    res.json(metadata);
  } catch (error) {
    logger.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

/**
 * GET /api/v1/photos/stats
 * Get photo statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await Photo.findAll({
      where: { user_id: req.user.id },
      attributes: [
        ['COUNT(*)', 'total'],
        ['SUM(file_size_bytes)', 'totalSize'],
      ],
      raw: true,
    });

    const galleryStats = await Gallery.findAll({
      where: { user_id: req.user.id },
      attributes: [['COUNT(*)', 'count']],
      raw: true,
    });

    res.json({
      totalPhotos: stats[0]?.total || 0,
      totalSize: stats[0]?.totalSize || 0,
      totalGalleries: galleryStats[0]?.count || 0,
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
