const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { Order, OrderItem, Product, Photo, PriceList } = require('../models');
const requireAuth = require('../middleware/auth.middleware');
const { keyId, keySecret } = require('../config/razorpay');

const getRazorpayInstance = () => {
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

function parseOrderNotes(order) {
  try {
    return order?.notes ? JSON.parse(order.notes) : {};
  } catch {
    return {};
  }
}

async function setOrderPaid({ order, razorpayOrderId, razorpayPaymentId, eventType = 'payment_succeeded', source = 'razorpay' }) {
  if (!order) return null;

  const notes = parseOrderNotes(order);
  if (!Array.isArray(notes.timeline)) notes.timeline = [];
  if (!Array.isArray(notes.refunds)) notes.refunds = [];

  if (order.status === 'paid' && (!razorpayPaymentId || notes.razorpay_payment_id === razorpayPaymentId)) {
    return order;
  }

  notes.gateway = source;
  notes.razorpay_order_id = razorpayOrderId || notes.razorpay_order_id || null;
  notes.razorpay_payment_id = razorpayPaymentId || notes.razorpay_payment_id || null;
  notes.timeline.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    created_at: new Date().toISOString(),
    type: eventType,
    title: 'Payment received',
    description: 'Razorpay payment was confirmed',
    status: 'paid',
    razorpay_order_id: razorpayOrderId || null,
    razorpay_payment_id: razorpayPaymentId || null,
    source,
  });

  await order.update({
    status: 'paid',
    notes: JSON.stringify(notes),
  });

  return order;
}

async function findOrderByRazorpayOrderId(razorpayOrderId) {
  if (!razorpayOrderId) return null;

  const instance = getRazorpayInstance();
  if (!instance) return null;

  const razorpayOrder = await instance.orders.fetch(razorpayOrderId);
  const receiptOrderId = String(razorpayOrder?.receipt || '').trim();
  if (!receiptOrderId) return null;

  return Order.findByPk(receiptOrderId);
}

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

// Create a Razorpay order for client-side checkout
router.post('/razorpay/create-order', requireAuth, async (req, res) => {
  try {
    if (!keyId || !keySecret) return res.status(400).json({ error: 'Razorpay not configured on server' });

    let { amount_cents, items, buyerEmail, buyerName } = req.body || {};

    let order;
    if (items && items.length) {
      const result = await createPendingOrderFromItems({ items, buyerEmail, buyerName, paymentGateway: 'razorpay' });
      order = result.order;
      amount_cents = result.totalCents;
    } else {
      // If client did not send items, require an explicit amount_cents to avoid accidental ₹1 default
      if (!amount_cents) {
        return res.status(400).json({ error: 'No items provided — supply `items` or `amount_cents` in request' });
      }

      // create a simple pending order record owned by the logged-in user
      const total = Math.max(1, parseInt(amount_cents, 10));
      const persistedBuyerEmail = String(buyerEmail || `pending+${Date.now()}@epixbox.local`).trim();
      order = await Order.create({
        buyer_email: persistedBuyerEmail,
        buyer_name: buyerName || null,
        photographer_id: req.user.id,
        status: 'pending',
        subtotal_cents: total,
        tax_cents: 0,
        total_cents: total,
        notes: JSON.stringify({ timeline: [], public_tracking_token: crypto.randomBytes(16).toString('hex') }),
      });
    }

    const instance = getRazorpayInstance();
    if (!instance) return res.status(400).json({ error: 'Razorpay not configured on server' });
    const razorAmount = Math.max(1, parseInt(amount_cents || order.total_cents || 100, 10));

    const razorOrder = await instance.orders.create({
      amount: razorAmount,
      currency: 'INR',
      receipt: String(order.id),
      payment_capture: 1,
      notes: {
        order_id: String(order.id),
        photographer_id: String(order.photographer_id),
        buyer_email: String(order.buyer_email || ''),
      },
    });

    const notes = parseOrderNotes(order);
    notes.gateway = 'razorpay';
    notes.razorpay_order_id = razorOrder.id;
    if (!Array.isArray(notes.timeline)) notes.timeline = [];
    if (!Array.isArray(notes.refunds)) notes.refunds = [];
    await order.update({ notes: JSON.stringify(notes) });

    res.json({ key_id: keyId, razorpay_order_id: razorOrder.id, amount: razorOrder.amount, currency: razorOrder.currency, orderId: order.id });
  } catch (err) {
    console.error('Razorpay create-order error:', err.message || err);
    res.status(500).json({ error: err.message || 'Failed to create razorpay order' });
  }
});

// Verify Razorpay payment signature (client posts payment_id, order_id, signature)
router.post('/razorpay/verify', async (req, res) => {
  try {
    if (!keySecret) return res.status(400).json({ error: 'Razorpay not configured on server' });
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ error: 'Missing verification fields' });

    const generated = crypto.createHmac('sha256', keySecret).update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
    if (generated === razorpay_signature) {
      const order = await findOrderByRazorpayOrderId(razorpay_order_id);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      await setOrderPaid({
        order,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        eventType: 'payment_verified',
        source: 'razorpay-client',
      });

      return res.json({ verified: true, orderId: order.id, orderStatus: 'paid' });
    }
    return res.status(400).json({ verified: false });
  } catch (err) {
    console.error('Razorpay verify error:', err.message || err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Razorpay webhook endpoint (payment captured / order paid)
router.post('/razorpay/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return res.status(400).json({ error: 'Razorpay webhook secret not configured' });

    const signature = req.headers['x-razorpay-signature'];
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
    if (!signature || !rawBody) {
      return res.status(400).json({ error: 'Missing webhook signature or body' });
    }

    const digest = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    if (digest !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = JSON.parse(rawBody);
    const eventType = String(event?.event || '').trim();
    const razorpayOrderId = event?.payload?.payment?.entity?.order_id
      || event?.payload?.order?.entity?.id
      || null;
    const razorpayPaymentId = event?.payload?.payment?.entity?.id || null;

    if (!razorpayOrderId) {
      return res.status(200).json({ received: true, ignored: true });
    }

    const order = await findOrderByRazorpayOrderId(razorpayOrderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'paid') {
      await setOrderPaid({
        order,
        razorpayOrderId,
        razorpayPaymentId,
        eventType: eventType || 'payment.captured',
        source: 'razorpay-webhook',
      });
    }

    res.json({ received: true, orderId: order.id, status: 'paid' });
  } catch (err) {
    console.error('Razorpay webhook error:', err.message || err);
    res.status(500).json({ error: err.message || 'Webhook processing failed' });
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
