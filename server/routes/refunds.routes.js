const express = require('express');
const { Refund, Order } = require('../models');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

// POST create refund
router.post('/:orderId', requireAuth, async (req, res, next) => {
  try {
    const { stripe_refund_id, amount_cents, reason, notes } = req.body;

    const order = await Order.findOne({
      where: { id: req.params.orderId, photographer_id: req.user.id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!stripe_refund_id || !amount_cents) {
      return res.status(400).json({ error: 'Missing refund details' });
    }

    const refund = await Refund.create({
      order_id: order.id,
      stripe_refund_id,
      amount_cents,
      reason,
      notes,
      created_by_user_id: req.user.id,
      status: 'pending',
    });

    res.status(201).json(refund);
  } catch (error) {
    next(error);
  }
});

// GET refund status
router.get('/:orderId/:refundId', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.orderId, photographer_id: req.user.id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const refund = await Refund.findOne({
      where: { id: req.params.refundId, order_id: order.id },
    });

    if (!refund) {
      return res.status(404).json({ error: 'Refund not found' });
    }

    res.json(refund);
  } catch (error) {
    next(error);
  }
});

// GET all refunds for order
router.get('/:orderId', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.orderId, photographer_id: req.user.id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const refunds = await Refund.findAll({
      where: { order_id: order.id },
    });

    res.json(refunds);
  } catch (error) {
    next(error);
  }
});

// PATCH update refund status (when Stripe webhook comes in)
router.patch('/update/:refundId', requireAuth, async (req, res, next) => {
  try {
    const { status, processed_at } = req.body;

    const refund = await Refund.findByPk(req.params.refundId, {
      include: [{ model: Order, where: { photographer_id: req.user.id } }],
    });

    if (!refund) {
      return res.status(404).json({ error: 'Refund not found' });
    }

    await refund.update({
      status,
      processed_at: processed_at || new Date(),
    });

    res.json(refund);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
