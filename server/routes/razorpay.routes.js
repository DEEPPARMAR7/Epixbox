const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { razorpay, keyId, keySecret } = require('../config/razorpay');
const { Order, OrderItem, Product, Photo, PriceList } = require('../models');
const { Op } = require('sequelize');

const createPendingOrderFromItems = async ({ items, buyerEmail, buyerName }) => {
  if (!items || !items.length) throw new Error('No items provided');

  let totalCents = 0;
  const orderItems = [];
  let resolvedPhotographerId = null;

  for (const item of items) {
    const product = await Product.findByPk(item.productId, {
      include: [{ model: PriceList, attributes: ['id', 'user_id'] }],
    });
    if (!product) throw new Error(`Product ${item.productId} not found`);

    const photo = await Photo.findByPk(item.photoId, { attributes: ['id', 'user_id'] });
    if (!photo) throw new Error(`Photo ${item.photoId} not found`);

    const photographerId = product.PriceList?.user_id;
    if (!photographerId || String(photographerId) !== String(photo.user_id)) {
      throw new Error('Invalid item mapping between product and photo owner');
    }

    if (!resolvedPhotographerId) resolvedPhotographerId = photographerId;
    if (String(resolvedPhotographerId) !== String(photographerId)) {
      throw new Error('All items in one order must belong to the same photographer');
    }

    const quantity = Math.max(1, Math.min(parseInt(item.quantity || 1, 10), 20));
    const itemTotal = product.price_cents * quantity;
    totalCents += itemTotal;

    orderItems.push({ product, photo_id: item.photoId, quantity });
  }

  if (!resolvedPhotographerId) throw new Error('Unable to resolve photographer for this order');

  const normalizedBuyerEmail = String(buyerEmail || '').trim().toLowerCase();
  const persistedBuyerEmail = normalizedBuyerEmail || `pending+${Date.now()}@epixbox.local`;
  const normalizedBuyerName = String(buyerName || '').trim() || null;

  const order = await Order.create({
    buyer_email: persistedBuyerEmail,
    buyer_name: normalizedBuyerName,
    photographer_id: resolvedPhotographerId,
    status: 'pending',
    subtotal_cents: totalCents,
    tax_cents: 0,
    total_cents: totalCents,
    notes: JSON.stringify({ timeline: [], refunds: [], external: {} }),
  });

  for (const oi of orderItems) {
    await OrderItem.create({
      order_id: order.id,
      photo_id: oi.photo_id,
      product_id: oi.product.id,
      quantity: oi.quantity,
      unit_price_cents: oi.product.price_cents,
      product_snapshot: { name: oi.product.name, category: oi.product.category, price_cents: oi.product.price_cents },
    });
  }

  return { order, lineItems: orderItems, totalCents };
};

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    if (!razorpay) return res.status(500).json({ error: 'Razorpay not configured on server' });

    const { items, buyerEmail, buyerName } = req.body;
    const { order, totalCents } = await createPendingOrderFromItems({ items, buyerEmail, buyerName });

    // Razorpay expects amount in paise (INR smallest unit)
    const currency = process.env.RAZORPAY_CURRENCY || 'INR';
    const amount = Math.max(0, parseInt(totalCents || 0, 10));
    const razorAmount = currency === 'INR' ? Math.round(amount) : Math.round(amount); // assume amounts stored as paise/cents already

    const rOrder = await razorpay.orders.create({
      amount: razorAmount,
      currency,
      receipt: String(order.id),
      payment_capture: 1,
    });

    // Persist mapping in order.notes.external
    const notes = JSON.parse(order.notes || '{}');
    notes.external = notes.external || {};
    notes.external.razorpayOrderId = rOrder.id;
    await order.update({ notes: JSON.stringify(notes) });

    res.json({ orderId: order.id, razorpayOrderId: rOrder.id, amount: rOrder.amount, currency, keyId });
  } catch (err) {
    console.error('Razorpay create-order error:', err.message || err);
    res.status(500).json({ error: err.message || 'Failed to create Razorpay order' });
  }
});

// Verify Razorpay payment signature and mark order paid
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing verification fields' });
    }

    if (!keySecret) return res.status(500).json({ error: 'Razorpay secret not configured' });

    const generated = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Find our order by receipt (we stored order.id as receipt)
    const orderId = String(req.body.receipt || '');
    let order = null;
    if (orderId) {
      order = await Order.findByPk(orderId);
    }
    if (!order) {
      order = await Order.findOne({ where: { notes: { [Op.like]: `%${razorpay_order_id}%` } } });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.update({ status: 'paid' });

    res.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error('Razorpay verify error:', err.message || err);
    res.status(500).json({ error: err.message || 'Failed to verify payment' });
  }
});

module.exports = router;
