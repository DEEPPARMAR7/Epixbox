const express = require('express');
const router = express.Router();
const { razorpay, keyId } = require('../config/razorpay');
const { Order } = require('../models');

// Dev/test-only endpoint to create a minimal Razorpay order without products.
// ENABLE_RAZORPAY_TEST must be set to 'true' in env for this route to work.
router.post('/create-order', async (req, res) => {
  try {
    if (String(process.env.ENABLE_RAZORPAY_TEST) !== 'true') {
      return res.status(403).json({ error: 'Razorpay test endpoint disabled' });
    }

    if (!razorpay) return res.status(500).json({ error: 'Razorpay not configured on server' });

    let { amount_cents, buyerEmail, buyerName } = req.body || {};
    const amount = Math.max(1, parseInt(amount_cents || 100, 10));

    const persistedBuyerEmail = String(buyerEmail || `pending+${Date.now()}@epixbox.local`).trim();

    const order = await Order.create({
      buyer_email: persistedBuyerEmail,
      buyer_name: buyerName || null,
      photographer_id: null,
      status: 'pending',
      subtotal_cents: amount,
      tax_cents: 0,
      total_cents: amount,
      notes: JSON.stringify({ timeline: [], refunds: [], external: {} }),
    });

    const razorOrder = await razorpay.orders.create({
      amount: amount,
      currency: process.env.RAZORPAY_CURRENCY || 'INR',
      receipt: String(order.id),
      payment_capture: 1,
    });

    const notes = JSON.parse(order.notes || '{}');
    notes.external = notes.external || {};
    notes.external.razorpayOrderId = razorOrder.id;
    await order.update({ notes: JSON.stringify(notes) });

    res.json({ keyId, razorpayOrderId: razorOrder.id, amount: razorOrder.amount, currency: razorOrder.currency, orderId: order.id });
  } catch (err) {
    console.error('Debug Razorpay create-order error:', err.message || err);
    res.status(500).json({ error: err.message || 'Failed to create debug razorpay order' });
  }
});

module.exports = router;
