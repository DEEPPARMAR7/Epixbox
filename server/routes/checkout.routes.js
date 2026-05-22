const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Order, OrderItem, Product, Photo, PriceList } = require('../models');

const createPendingOrderFromItems = async ({ items, buyerEmail, buyerName, paymentGateway }) => {
  if (!items || !items.length) {
    throw new Error('No items provided');
  }

  let totalCents = 0;
  const orderItems = [];
  let resolvedPhotographerId = null;

  for (const item of items) {
    const product = await Product.findByPk(item.productId, {
      include: [{ model: PriceList, attributes: ['id', 'user_id'] }],
    });
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    const photo = await Photo.findByPk(item.photoId, { attributes: ['id', 'user_id'] });
    if (!photo) {
      throw new Error(`Photo ${item.photoId} not found`);
    }

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

  if (!resolvedPhotographerId) {
    throw new Error('Unable to resolve photographer for this order');
  }

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
    notes: JSON.stringify({
      public_tracking_token: crypto.randomBytes(16).toString('hex'),
      timeline: [],
      refunds: [],
    }),
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

// Get available payment methods for checkout
router.get('/payment-methods', async (req, res) => {
  try {
    const methods = [];


    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (paypalClientId && paypalClientSecret && !paypalClientId.includes('YOUR_PAYPAL')) {
      methods.push({
        id: 'paypal',
        name: 'PayPal',
        description: 'Fast and secure',
        icon: 'paypal',
        enabled: true,
      });
    }

    const razorKey = process.env.RAZORPAY_KEY_ID;
    if (razorKey) {
      methods.push({
        id: 'razorpay',
        name: 'Razorpay',
        description: 'Razorpay (INR) - available',
        icon: 'credit-card',
        enabled: true,
      });
    }

    res.json(methods);
  } catch (error) {
    console.error('Error fetching payment methods:', error.message);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// Create checkout session with payment method selection
router.post('/create-session', async (req, res) => {
  // Stripe hosted sessions are intentionally disabled. Use Razorpay endpoints or external redirect.
  res.status(400).json({ error: 'Hosted Stripe sessions are disabled. Use Razorpay or external redirect flow.' });
});

// Dev-only: create a simple PaymentIntent for testing without products
// External redirect checkout (third-party hosted checkout like SmugMug)
router.post('/external-redirect', async (req, res) => {
  try {
    const { items, buyerEmail, buyerName } = req.body;
    const { order } = await createPendingOrderFromItems({ items, buyerEmail, buyerName, paymentGateway: 'external' });

    const template = process.env.EXTERNAL_CHECKOUT_URL_TEMPLATE || 'https://example.com/thirdparty/checkout?orderId={orderId}';
    const redirectUrl = template.replace('{orderId}', encodeURIComponent(order.id));

    res.json({ redirectUrl, orderId: order.id });
  } catch (err) {
    console.error('External redirect error:', err.message || err);
    res.status(500).json({ error: err.message || 'Failed to create external redirect' });
  }
});

module.exports = router;
