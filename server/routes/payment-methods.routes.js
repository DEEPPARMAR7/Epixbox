const express = require('express');
const { SavedPaymentMethod } = require('../models');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

// POST save payment method
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { stripe_payment_method_id, stripe_customer_id, nickname, type, card_last_four, card_brand, card_exp_month, card_exp_year } = req.body;

    if (!stripe_payment_method_id || !stripe_customer_id) {
      return res.status(400).json({ error: 'Stripe IDs required' });
    }

    const method = await SavedPaymentMethod.create({
      user_id: req.user.id,
      stripe_payment_method_id,
      stripe_customer_id,
      nickname,
      type,
      card_last_four,
      card_brand,
      card_exp_month,
      card_exp_year,
    });

    res.status(201).json(method);
  } catch (error) {
    next(error);
  }
});

// GET all saved payment methods
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const methods = await SavedPaymentMethod.findAll({
      where: { user_id: req.user.id, is_active: true },
      attributes: ['id', 'nickname', 'type', 'card_last_four', 'card_brand', 'card_exp_month', 'card_exp_year', 'is_default'],
    });

    res.json(methods);
  } catch (error) {
    next(error);
  }
});

// PATCH set as default
router.patch('/:id/default', requireAuth, async (req, res, next) => {
  try {
    // Unset all others as default
    await SavedPaymentMethod.update(
      { is_default: false },
      { where: { user_id: req.user.id } }
    );

    // Set this one as default
    const method = await SavedPaymentMethod.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!method) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    await method.update({ is_default: true });
    res.json(method);
  } catch (error) {
    next(error);
  }
});

// DELETE payment method
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const method = await SavedPaymentMethod.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!method) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    await method.update({ is_active: false });
    res.json({ message: 'Payment method removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
