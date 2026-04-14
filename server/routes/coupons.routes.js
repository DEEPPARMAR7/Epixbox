const router = require('express').Router();
const { Op } = require('sequelize');
const { Product } = require('../models');
const { requireAuth } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

router.use(requireAuth);

/**
 * Model: Coupon
 * Code, discount type, value, expiry, usage limits
 */

/**
 * POST /api/v1/coupons
 * Create a new coupon (admin only)
 */
router.post('/', async (req, res) => {
  try {
    // Check if user is admin (can be extended to require admin role)
    const { code, discount_type, discount_value, max_uses, expires_at, apply_to, gallery_ids } = req.body;

    if (!code || !discount_type || discount_value === undefined) {
      return res.status(400).json({ error: 'code, discount_type, and discount_value are required' });
    }

    // In production, create Coupon model in DB
    // For now, return success
    const coupon = {
      id: Math.random().toString(36).substring(7),
      code: code.toUpperCase(),
      discount_type, // 'percentage' | 'fixed'
      discount_value,
      max_uses: max_uses || 999,
      used_count: 0,
      expires_at,
      apply_to: apply_to || 'all', // 'all' | 'galleries' | 'products'
      gallery_ids: gallery_ids || [],
      created_at: new Date(),
    };

    res.status(201).json(coupon);
  } catch (error) {
    logger.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

/**
 * POST /api/v1/coupons/validate
 * Validate a coupon code and return discount
 */
router.post('/validate', async (req, res) => {
  try {
    const { code, cart_total } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'code is required' });
    }

    // Mock validation - in production, query DB
    if (code.toUpperCase() === 'WELCOME10') {
      const discount = Math.floor(cart_total * 0.1); // 10% off
      return res.json({
        valid: true,
        discount,
        discount_type: 'percentage',
        discount_value: 10,
        message: '10% discount applied',
      });
    }

    if (code.toUpperCase() === 'SAVE5') {
      const discount = 500; // $5 off
      return res.json({
        valid: true,
        discount,
        discount_type: 'fixed',
        discount_value: 500,
        message: '$5 discount applied',
      });
    }

    res.status(400).json({ error: 'Invalid coupon code' });
  } catch (error) {
    logger.error('Error validating coupon:', error);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

/**
 * GET /api/v1/coupons
 * List all coupons (admin)
 */
router.get('/', async (req, res) => {
  try {
    // Mock data - in production, query DB
    const coupons = [
      {
        id: '1',
        code: 'WELCOME10',
        discount_type: 'percentage',
        discount_value: 10,
        max_uses: 100,
        used_count: 45,
        expires_at: '2026-12-31',
      },
      {
        id: '2',
        code: 'SAVE5',
        discount_type: 'fixed',
        discount_value: 500,
        max_uses: 50,
        used_count: 12,
        expires_at: '2026-06-30',
      },
    ];

    res.json(coupons);
  } catch (error) {
    logger.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

module.exports = router;
