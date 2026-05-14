const router = require('express').Router();
const crypto = require('crypto');
const stripe = require('../config/stripe');
const { Order, OrderItem, Product, Photo, PriceList } = require('../models/index');
const requireAuth = require('../middleware/auth.middleware');
const { sendOrderConfirmation } = require('../services/email.service');
const { pushUserNotification } = require('../services/realtime.service');

const ORDER_STATUSES = new Set(['pending', 'paid', 'processing', 'shipped', 'cancelled']);

function parseOrderMeta(order) {
  try {
    const parsed = order?.notes ? JSON.parse(order.notes) : {};
    if (!parsed || typeof parsed !== 'object') return { timeline: [] };
    if (!Array.isArray(parsed.timeline)) parsed.timeline = [];
    if (!Array.isArray(parsed.refunds)) parsed.refunds = [];
    return parsed;
  } catch {
    return { timeline: [], refunds: [] };
  }
}

async function updateOrderMeta(order, updater) {
  const meta = parseOrderMeta(order);
  const next = updater({ ...meta }) || meta;
  if (!Array.isArray(next.timeline)) next.timeline = [];
  if (!Array.isArray(next.refunds)) next.refunds = [];
  await order.update({ notes: JSON.stringify(next) });
  return next;
}

async function appendOrderTimelineEvent(order, event) {
  await updateOrderMeta(order, (meta) => {
    const timeline = Array.isArray(meta.timeline) ? meta.timeline : [];
    timeline.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      created_at: new Date().toISOString(),
      ...event,
    });
    meta.timeline = timeline;
    return meta;
  });
}

function timelineForOrder(order) {
  const meta = parseOrderMeta(order);
  return (meta.timeline || []).slice().sort((a, b) => {
    const aTime = new Date(a.created_at || 0).getTime();
    const bTime = new Date(b.created_at || 0).getTime();
    return aTime - bTime;
  });
}

function getOrderPublicTrackingToken(order) {
  const meta = parseOrderMeta(order);
  return meta.public_tracking_token || null;
}

function refundedTotalCents(order) {
  const meta = parseOrderMeta(order);
  return (meta.refunds || []).reduce((sum, r) => sum + Number(r?.amount_cents || 0), 0);
}

function mapStripeRefundReason(reason) {
  const normalized = String(reason || '').trim().toLowerCase();
  if (normalized === 'requested_by_customer') return 'requested_by_customer';
  if (normalized === 'duplicate') return 'duplicate';
  if (normalized === 'fraud' || normalized === 'fraudulent') return 'fraudulent';
  return null;
}

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
      notes: JSON.stringify({
        public_tracking_token: crypto.randomBytes(16).toString('hex'),
        timeline: [],
        refunds: [],
      }),
    });

    await appendOrderTimelineEvent(order, {
      type: 'order_created',
      title: 'Order created',
      description: 'Order created and payment intent generated',
      status: 'pending',
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

    res.status(201).json({
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
      trackingToken: getOrderPublicTrackingToken(order),
    });
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
      await appendOrderTimelineEvent(order, {
        type: 'payment_succeeded',
        title: 'Payment received',
        description: 'Stripe payment intent was captured successfully',
        status: 'paid',
        stripe_payment_intent_id: pi.id,
      });
      pushUserNotification(order.photographer_id, {
        type: 'order.paid',
        title: 'Order Paid',
        message: `Order ${order.id.slice(0, 8)} has been paid`,
        orderId: order.id,
      });
      try { await sendOrderConfirmation({ to: order.buyer_email, order }); } catch {}
    }
  }

  // Handle Checkout Session completion (for hosted Checkout)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Log successful checkout session
    console.log('Checkout session completed:', {
      sessionId: session.id,
      customer: session.customer,
      payment_status: session.payment_status,
      metadata: session.metadata,
    });
    // Try to match session to an Order and mark it as paid if applicable
    try {
      const orderIdFromMeta = session.metadata && session.metadata.orderId ? String(session.metadata.orderId) : null;
      let order = null;
      if (orderIdFromMeta) {
        order = await Order.findByPk(orderIdFromMeta);
      }
      if (!order) {
        // try matching by stored checkout_session_id
        order = await Order.findOne({ where: { checkout_session_id: session.id } });
      }

      if (order) {
        // If not already marked paid, mark as paid and log timeline
        if (order.status !== 'paid') {
          const paymentIntentId = session.payment_intent || null;
          await order.update({ status: 'paid', stripe_payment_intent_id: paymentIntentId });
          await appendOrderTimelineEvent(order, {
            type: 'checkout_completed',
            title: 'Checkout completed',
            description: `Hosted Checkout session ${session.id} completed`,
            status: 'paid',
            checkout_session_id: session.id,
            stripe_payment_intent_id: paymentIntentId,
          });
          pushUserNotification(order.photographer_id, {
            type: 'order.paid',
            title: 'Order Paid',
            message: `Order ${order.id.slice(0,8)} has been paid via hosted Checkout`,
            orderId: order.id,
          });
          try { await sendOrderConfirmation({ to: order.buyer_email, order }); } catch (e) { /* ignore */ }
        }
      }
    } catch (err) {
      console.error('Error reconciling checkout.session.completed -> order:', err?.message || err);
    }
  }

  res.json({ received: true });
});

// GET /api/orders/mine
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { photographer_id: req.user.id },
    });
    const sortedOrders = orders
      .map((order) => (order.toJSON ? order.toJSON() : order))
      .sort((a, b) => {
        const aTime = new Date(a.created_at || a.createdAt || 0).getTime();
        const bTime = new Date(b.created_at || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
    res.json(sortedOrders);
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
    const nextStatus = String(req.body.status || '').trim();
    if (!ORDER_STATUSES.has(nextStatus)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const prevStatus = order.status;
    await order.update({ status: nextStatus });
    await appendOrderTimelineEvent(order, {
      type: 'status_updated',
      title: `Status changed to ${nextStatus}`,
      description: prevStatus && prevStatus !== nextStatus
        ? `Order moved from ${prevStatus} to ${nextStatus}`
        : `Order status set to ${nextStatus}`,
      status: nextStatus,
      previous_status: prevStatus,
    });

    pushUserNotification(req.user.id, {
      type: 'order.status_changed',
      title: 'Order Status Updated',
      message: `Order ${order.id.slice(0, 8)} status changed to ${order.status}`,
      orderId: order.id,
    });
    res.json(order);
  } catch (err) { next(err); }
});

// PATCH /api/orders/mine/:id/shipping
router.patch('/mine/:id/shipping', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, photographer_id: req.user.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const shipping_carrier = req.body.shipping_carrier ? String(req.body.shipping_carrier).trim() : null;
    const tracking_number = req.body.tracking_number ? String(req.body.tracking_number).trim() : null;
    const estimated_delivery = req.body.estimated_delivery ? new Date(req.body.estimated_delivery) : null;
    if (estimated_delivery && Number.isNaN(estimated_delivery.getTime())) {
      return res.status(400).json({ error: 'Invalid estimated_delivery value' });
    }

    const markShipped = req.body.mark_shipped === true || req.body.status === 'shipped';
    const updates = {
      shipping_carrier,
      tracking_number,
      estimated_delivery,
    };

    if (markShipped) {
      updates.status = 'shipped';
      updates.shipped_at = order.shipped_at || new Date();
    }

    await order.update(updates);
    await appendOrderTimelineEvent(order, {
      type: 'shipping_updated',
      title: markShipped ? 'Order shipped' : 'Shipping updated',
      description: tracking_number
        ? `Tracking ${tracking_number}${shipping_carrier ? ` via ${shipping_carrier}` : ''}`
        : 'Shipping details were updated',
      status: order.status,
      shipping_carrier: order.shipping_carrier,
      tracking_number: order.tracking_number,
      estimated_delivery: order.estimated_delivery,
      shipped_at: order.shipped_at,
    });

    res.json(order);
  } catch (err) { next(err); }
});

// POST /api/orders/mine/:id/refunds
router.post('/mine/:id/refunds', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, photographer_id: req.user.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (!['paid', 'processing', 'shipped', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ error: 'Order is not eligible for refund yet' });
    }

    const paymentIntentOrCharge = order.stripe_charge_id || order.stripe_payment_intent_id;
    if (!paymentIntentOrCharge) {
      return res.status(400).json({ error: 'No Stripe payment reference available for this order' });
    }

    const refundedSoFar = refundedTotalCents(order);
    const maxRefundable = Math.max(0, Number(order.total_cents || 0) - refundedSoFar);
    if (maxRefundable <= 0) {
      return res.status(400).json({ error: 'This order is already fully refunded' });
    }

    const requestedAmount = req.body?.amount_cents !== undefined && req.body?.amount_cents !== null
      ? Number(req.body.amount_cents)
      : maxRefundable;
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return res.status(400).json({ error: 'amount_cents must be a positive number' });
    }
    const amount_cents = Math.min(Math.floor(requestedAmount), maxRefundable);

    const stripeReason = mapStripeRefundReason(req.body?.reason);
    const refundPayload = {
      amount: amount_cents,
      metadata: {
        order_id: String(order.id),
        photographer_id: String(req.user.id),
      },
    };

    if (order.stripe_charge_id) refundPayload.charge = order.stripe_charge_id;
    else refundPayload.payment_intent = order.stripe_payment_intent_id;
    if (stripeReason) refundPayload.reason = stripeReason;

    const refund = await stripe.refunds.create(refundPayload);

    await updateOrderMeta(order, (meta) => {
      const refunds = Array.isArray(meta.refunds) ? meta.refunds : [];
      refunds.push({
        id: refund.id,
        amount_cents,
        reason: req.body?.reason || 'other',
        notes: req.body?.notes || null,
        status: refund.status || 'pending',
        created_at: new Date().toISOString(),
      });
      meta.refunds = refunds;
      return meta;
    });

    await appendOrderTimelineEvent(order, {
      type: 'refund_created',
      title: 'Refund issued',
      description: `Refund ${refund.id} created for ${(amount_cents / 100).toFixed(2)} USD`,
      status: order.status,
      refund_id: refund.id,
      amount_cents,
      reason: req.body?.reason || 'other',
    });

    const totalRefunded = refundedTotalCents(order);
    if (totalRefunded >= Number(order.total_cents || 0) && order.status !== 'cancelled') {
      await order.update({ status: 'cancelled' });
      await appendOrderTimelineEvent(order, {
        type: 'order_fully_refunded',
        title: 'Order fully refunded',
        description: 'Refund amount reached order total, order marked as cancelled',
        status: 'cancelled',
      });
    }

    pushUserNotification(req.user.id, {
      type: 'order.refund_created',
      title: 'Refund Created',
      message: `Refund ${refund.id} created for order ${order.id.slice(0, 8)}`,
      orderId: order.id,
    });

    res.status(201).json({
      refund: {
        id: refund.id,
        amount_cents,
        status: refund.status || 'pending',
        reason: req.body?.reason || 'other',
      },
      order_status: order.status,
      refunded_total_cents: totalRefunded,
      refundable_remaining_cents: Math.max(0, Number(order.total_cents || 0) - totalRefunded),
    });
  } catch (err) { next(err); }
});

// GET /api/orders/public/:id/status?token=...
router.get('/public/:id/status', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, include: [{ model: Photo, attributes: ['id', 'title'] }] }],
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const token = String(req.query.token || req.headers['x-order-tracking-token'] || '').trim();
    const expected = getOrderPublicTrackingToken(order);
    if (!expected || token !== expected) {
      return res.status(403).json({ error: 'Invalid tracking token' });
    }

    const maskedEmail = String(order.buyer_email || '')
      .replace(/(^.).*(@.*$)/, '$1***$2');

    res.json({
      id: order.id,
      buyer_name: order.buyer_name || null,
      buyer_email_masked: maskedEmail,
      status: order.status,
      subtotal_cents: order.subtotal_cents,
      total_cents: order.total_cents,
      created_at: order.created_at,
      shipping: {
        shipping_carrier: order.shipping_carrier || null,
        tracking_number: order.tracking_number || null,
        estimated_delivery: order.estimated_delivery || null,
        shipped_at: order.shipped_at || null,
      },
      timeline: timelineForOrder(order),
      refunds: parseOrderMeta(order).refunds || [],
      items: (order.OrderItems || []).map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
        product_snapshot: item.product_snapshot,
        photo: item.Photo ? { id: item.Photo.id, title: item.Photo.title } : null,
      })),
    });
  } catch (err) { next(err); }
});

// GET /api/orders/mine/:id/timeline
router.get('/mine/:id/timeline', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, photographer_id: req.user.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({
      order_id: order.id,
      timeline: timelineForOrder(order),
      shipping: {
        shipping_carrier: order.shipping_carrier || null,
        tracking_number: order.tracking_number || null,
        estimated_delivery: order.estimated_delivery || null,
        shipped_at: order.shipped_at || null,
      },
      refunds: parseOrderMeta(order).refunds || [],
      refunded_total_cents: refundedTotalCents(order),
    });
  } catch (err) { next(err); }
});

module.exports = router;
