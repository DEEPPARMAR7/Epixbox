const router = require('express').Router();
const stripe = require('../config/stripe');
const { Order, OrderItem, Product, Photo } = require('../models/index');
const requireAuth = require('../middleware/auth.middleware');
const { sendOrderConfirmation } = require('../services/email.service');
const { pushUserNotification } = require('../services/realtime.service');

// POST /api/orders — create order + Stripe PaymentIntent
router.post('/', async (req, res, next) => {
  try {
    const { items, buyer_email, buyer_name, shipping_address, photographer_id } = req.body;
    if (!items || !items.length || !buyer_email || !photographer_id) {
      return res.status(400).json({ error: 'items, buyer_email, and photographer_id are required' });
    }

    // Calculate totals
    let subtotal_cents = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) return res.status(400).json({ error: `Product ${item.product_id} not found` });
      const qty = item.quantity || 1;
      subtotal_cents += product.price_cents * qty;
      orderItems.push({ product, photo_id: item.photo_id, quantity: qty });
    }
    const total_cents = subtotal_cents;

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total_cents,
      currency: 'usd',
      metadata: { buyer_email, photographer_id },
    });

    // Create order
    const order = await Order.create({
      buyer_email, buyer_name, photographer_id,
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
      await order.update({ status: 'paid', stripe_charge_id: pi.latest_charge });
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
