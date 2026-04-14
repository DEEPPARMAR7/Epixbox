const router = require('express').Router();
const stripe = require('../config/stripe');
const { Order, OrderItem, Product, Photo, PriceList } = require('../models/index');
const requireAuth = require('../middleware/auth.middleware');
const { sendOrderConfirmation } = require('../services/email.service');
const { pushUserNotification } = require('../services/realtime.service');

// POST /api/orders — create order + Stripe PaymentIntent
router.post('/', async (req, res, next) => {
  try {
    const { items, buyer_email, buyer_name, shipping_address } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'items are required' });
    }

    // Calculate totals
    let subtotal_cents = 0;
    const orderItems = [];
    let resolvedPhotographerId = null;

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, {
        include: [{ model: PriceList, attributes: ['id', 'user_id'] }],
      });
      if (!product) return res.status(400).json({ error: `Product ${item.product_id} not found` });

      const photo = await Photo.findByPk(item.photo_id, { attributes: ['id', 'user_id'] });
      if (!photo) return res.status(400).json({ error: `Photo ${item.photo_id} not found` });

      const photographerId = product.PriceList?.user_id;
      if (!photographerId || String(photographerId) !== String(photo.user_id)) {
        return res.status(400).json({ error: 'Invalid item mapping between product and photo owner' });
      }

      if (!resolvedPhotographerId) resolvedPhotographerId = photographerId;
      if (String(resolvedPhotographerId) !== String(photographerId)) {
        return res.status(400).json({ error: 'All items in one order must belong to the same photographer' });
      }

      const qty = Math.max(1, Math.min(parseInt(item.quantity || 1, 10), 20));
      subtotal_cents += product.price_cents * qty;
      orderItems.push({ product, photo_id: item.photo_id, quantity: qty });
    }

    if (!resolvedPhotographerId) {
      return res.status(400).json({ error: 'Unable to resolve photographer for this order' });
    }

    const total_cents = subtotal_cents;
    const normalizedBuyerEmail = String(buyer_email || '').trim().toLowerCase();
    const persistedBuyerEmail = normalizedBuyerEmail || `pending+${Date.now()}@epixbox.local`;
    const normalizedBuyerName = String(buyer_name || '').trim() || null;

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total_cents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { buyer_email: persistedBuyerEmail, photographer_id: String(resolvedPhotographerId) },
    });

    // Create order
    const order = await Order.create({
      buyer_email: persistedBuyerEmail,
      buyer_name: normalizedBuyerName,
      photographer_id: resolvedPhotographerId,
      stripe_payment_intent_id: paymentIntent.id,
      status: 'pending',
      subtotal_cents, tax_cents: 0, total_cents,
      shipping_address,
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

    res.status(201).json({ orderId: order.id, clientSecret: paymentIntent.client_secret });
  } catch (err) { next(err); }
});

// POST /api/orders/webhook — Stripe webhook
router.post('/webhook', async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const order = await Order.findOne({ where: { stripe_payment_intent_id: pi.id } });
    if (order) {
      const receiptEmail = pi.receipt_email || pi.charges?.data?.[0]?.billing_details?.email || null;
      const nextBuyerEmail = receiptEmail && String(order.buyer_email || '').endsWith('@epixbox.local')
        ? receiptEmail
        : order.buyer_email;

      await order.update({ status: 'paid', stripe_charge_id: pi.latest_charge, buyer_email: nextBuyerEmail });
      pushUserNotification(order.photographer_id, {
        type: 'order.paid',
        title: 'Order Paid',
        message: `Order ${order.id.slice(0, 8)} has been paid`,
        orderId: order.id,
      });
      try { await sendOrderConfirmation({ to: order.buyer_email, order }); } catch {}
    }
  }
  res.json({ received: true });
});

// GET /api/orders/mine
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { photographer_id: req.user.id },
      include: [{ model: OrderItem }],
      order: [['created_at', 'DESC']],
    });
    res.json(orders);
  } catch (err) { next(err); }
});

// GET /api/orders/mine/:id
router.get('/mine/:id', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, photographer_id: req.user.id },
      include: [{ model: OrderItem, include: [{ model: Photo, attributes: ['id', 'title', 's3_key_thumb'] }] }],
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
});

// PATCH /api/orders/mine/:id/status
router.patch('/mine/:id/status', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, photographer_id: req.user.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await order.update({ status: req.body.status });
    pushUserNotification(req.user.id, {
      type: 'order.status_changed',
      title: 'Order Status Updated',
      message: `Order ${order.id.slice(0, 8)} status changed to ${order.status}`,
      orderId: order.id,
    });
    res.json(order);
  } catch (err) { next(err); }
});

module.exports = router;
