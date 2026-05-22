const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const stripe = require('../config/stripe');
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
    payment_gateway: paymentGateway,
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

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (stripeSecretKey && !stripeSecretKey.includes('placeholder')) {
      const stripeLabel = stripeSecretKey.includes('sk_test_')
        ? 'Card via Stripe (test mode)'
        : 'Card via Stripe';

      methods.push({
        id: 'stripe',
        name: 'Stripe',
        description: stripeLabel,
        icon: 'stripe',
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
  try {
    const { paymentMethod = 'paypal', items, buyerEmail, buyerName } = req.body;

    if (paymentMethod === 'paypal') {
      return res.status(400).json({ error: 'Use the PayPal order endpoints for PayPal checkout' });
    }

    if (paymentMethod !== 'stripe') {
      return res.status(400).json({ error: `Payment method '${paymentMethod}' is not enabled.` });
    }

    if (!process.env.STRIPE_PUBLISHABLE_KEY || !process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe is not configured on the server.' });
    }

    const { order, lineItems, totalCents } = await createPendingOrderFromItems({
      items,
      buyerEmail,
      buyerName,
      paymentGateway: 'stripe',
    });

    const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems.map((item) => ({
        price_data: {
          currency: 'usd',
          unit_amount: item.product.price_cents,
          product_data: {
            name: item.product.name,
            description: item.product.description || undefined,
          },
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      customer_email: buyerEmail || undefined,
      metadata: {
        orderId: order.id,
        buyerName: buyerName || '',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ sessionId: session.id, orderId: order.id });
  } catch (error) {
    console.error('Error creating checkout session:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.message || error.message || 'Failed to create checkout session' });
  }
});

// Dev-only: create a simple PaymentIntent for testing without products
router.post('/test-intent', async (req, res) => {
  res.status(400).json({ error: 'Stripe test intent is disabled. Use PayPal checkout instead.' });
});

// Create a hosted Checkout Session from multiple cart items and create an Order record
router.post('/create-session-from-items', async (req, res) => {
  res.status(400).json({
    error: 'Stripe hosted checkout from cart items is disabled. Use PayPal checkout instead.',
  });
});

module.exports = router;
