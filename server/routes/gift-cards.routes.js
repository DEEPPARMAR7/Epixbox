const express = require('express');
const crypto = require('crypto');
const { GiftCard } = require('../../models');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

// POST create gift card
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { initial_value_cents, sender_name, recipient_email, message, expires_at } = req.body;

    if (!initial_value_cents || initial_value_cents < 100) {
      return res.status(400).json({ error: 'Minimum gift card value is $1.00' });
    }

    // Generate unique code
    const code = `GIFT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    const giftCard = await GiftCard.create({
      user_id: req.user.id,
      code,
      balance_cents: initial_value_cents,
      initial_value_cents,
      sender_name,
      recipient_email,
      message,
      expires_at,
    });

    res.status(201).json(giftCard);
  } catch (error) {
    next(error);
  }
});

// GET all gift cards for user
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await GiftCard.findAndCountAll({
      where: { user_id: req.user.id },
      offset,
      limit,
      order: [['created_at', 'DESC']],
    });

    res.json({
      items: rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    next(error);
  }
});

// POST validate & redeem gift card
router.post('/redeem/:code', async (req, res, next) => {
  try {
    const giftCard = await GiftCard.findOne({
      where: { code: req.params.code, is_active: true },
    });

    if (!giftCard) {
      return res.status(404).json({ error: 'Invalid gift card code' });
    }

    if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Gift card expired' });
    }

    if (giftCard.balance_cents <= 0) {
      return res.status(400).json({ error: 'Gift card balance exhausted' });
    }

    res.json({
      code: giftCard.code,
      balance_cents: giftCard.balance_cents,
      valid: true,
    });
  } catch (error) {
    next(error);
  }
});

// GET gift card balance
router.get('/balance/:code', async (req, res, next) => {
  try {
    const giftCard = await GiftCard.findOne({
      where: { code: req.params.code },
      attributes: ['code', 'balance_cents', 'expires_at', 'is_active'],
    });

    if (!giftCard || !giftCard.is_active) {
      return res.status(404).json({ error: 'Gift card not found' });
    }

    res.json({
      code: giftCard.code,
      balance_cents: giftCard.balance_cents,
      expired: giftCard.expires_at && new Date(giftCard.expires_at) < new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH apply gift card to order (deduct balance)
router.patch('/:id/apply', requireAuth, async (req, res, next) => {
  try {
    const { amount_cents } = req.body;

    const giftCard = await GiftCard.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!giftCard) {
      return res.status(404).json({ error: 'Gift card not found' });
    }

    if (giftCard.balance_cents < amount_cents) {
      return res.status(400).json({ error: 'Insufficient gift card balance' });
    }

    await giftCard.update({
      balance_cents: giftCard.balance_cents - amount_cents,
      last_used_at: new Date(),
      first_used_at: giftCard.first_used_at || new Date(),
    });

    res.json({
      code: giftCard.code,
      remaining_balance_cents: giftCard.balance_cents - amount_cents,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
