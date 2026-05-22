const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op, fn, col } = require('sequelize');
const requireAuth = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { User, Gallery, Photo, Order, OrderItem, SubscriptionPlan, sequelize } = require('../models/index');
const { getRateAnalytics } = require('../services/rateAnalytics.service');
const { deleteFile } = require('../services/s3.service');
const { getOwnerEmails } = require('../utils/roles');

function parseOrderMeta(order) {
  try {
    const parsed = order?.notes ? JSON.parse(order.notes) : {};
    if (!parsed || typeof parsed !== 'object') return { timeline: [], refunds: [] };
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
  return (meta.timeline || []).slice().sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
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
  return (meta.timeline || []).slice().sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
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

router.get('/analytics', async (req, res, next) => {
  try {
    const [usersCount, galleriesCount, photosCount, ordersCount] = await Promise.all([
      User.count(),
      Gallery.count(),
      Photo.count(),
      Order.count(),
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [newUsers7d, uploads7d] = await Promise.all([
      User.count({ where: { created_at: { [Op.gte]: sevenDaysAgo } } }),
      Photo.count({ where: { created_at: { [Op.gte]: sevenDaysAgo } } }),
    ]);

    res.json({
      totals: {
        users: usersCount,
        galleries: galleriesCount,
        photos: photosCount,
        orders: ordersCount,
      },
      last7Days: {
        newUsers: newUsers7d,
        uploads: uploads7d,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/rate-analytics', (req, res) => {
  res.json(getRateAnalytics());
});

router.get('/users', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const offset = (page - 1) * limit;
    const search = String(req.query.search || '').trim();

    const where = {};
    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } },
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: ['id', 'email', 'username', 'first_name', 'last_name', 'is_active', 'email_verified', 'created_at'],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({
      items: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const is_active = Boolean(req.body?.is_active);
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (String(user.id) === String(req.user.id) && !is_active) {
      return res.status(400).json({ error: 'You cannot deactivate your own admin account' });
    }
    await user.update({ is_active });
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      is_active: user.is_active,
      email_verified: user.email_verified,
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/verify', async (req, res, next) => {
  try {
    const email_verified = Boolean(req.body?.email_verified);
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.update({ email_verified });
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      is_active: user.is_active,
      email_verified: user.email_verified,
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (String(user.id) === String(req.user.id)) {
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

router.post('/users/:id/reset-password', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const temporaryPassword = crypto.randomBytes(6).toString('hex');
    const password_hash = await bcrypt.hash(temporaryPassword, 10);
    await user.update({
      password_hash,
      password_reset_token: null,
      password_reset_expires: null,
    });

    res.json({
      message: 'Password reset completed',
      temporaryPassword,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/media/photos', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const offset = (page - 1) * limit;
    const search = String(req.query.search || '').trim();

    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { filename_original: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Photo.findAndCountAll({
      where,
      attributes: ['id', 'title', 'filename_original', 'file_size_bytes', 'mime_type', 'created_at', 'user_id', 'gallery_id', 's3_key_original', 's3_key_large', 's3_key_medium', 's3_key_thumb'],
      include: [
        { model: User, attributes: ['id', 'email', 'username', 'first_name', 'last_name'] },
        { model: Gallery, attributes: ['id', 'title'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({
      items: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/media/photos/:id', async (req, res, next) => {
  try {
    const photo = await Photo.findByPk(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    const keys = [photo.s3_key_original, photo.s3_key_large, photo.s3_key_medium, photo.s3_key_thumb].filter(Boolean);
    for (const key of keys) {
      try {
        await deleteFile(key);
      } catch {}
    }

    await Gallery.decrement('photos_count', { where: { id: photo.gallery_id } });
    await photo.destroy();

    res.json({ message: 'Photo removed by admin moderation' });
  } catch (err) {
    next(err);
  }
});

router.get('/media/overview', async (req, res, next) => {
  try {
    const [totalsRow] = await Photo.findAll({
      attributes: [
        [fn('COUNT', col('id')), 'photos'],
        [fn('COALESCE', fn('SUM', col('file_size_bytes')), 0), 'storage_bytes'],
      ],
      raw: true,
    });

    const topUsers = await Photo.findAll({
      attributes: [
        'user_id',
        [fn('COUNT', col('Photo.id')), 'photos_count'],
        [fn('COALESCE', fn('SUM', col('file_size_bytes')), 0), 'storage_bytes'],
      ],
      include: [{ model: User, attributes: ['id', 'email', 'username'] }],
      group: ['user_id', 'User.id'],
      order: [[fn('COALESCE', fn('SUM', col('file_size_bytes')), 0), 'DESC']],
      limit: 5,
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [uploads7d, galleries7d] = await Promise.all([
      Photo.count({ where: { created_at: { [Op.gte]: sevenDaysAgo } } }),
      Gallery.count({ where: { created_at: { [Op.gte]: sevenDaysAgo } } }),
    ]);

    res.json({
      totals: {
        photos: Number(totalsRow?.photos || 0),
        storageBytes: Number(totalsRow?.storage_bytes || 0),
      },
      activity7d: {
        uploads: uploads7d,
        galleriesCreated: galleries7d,
      },
      topUsers,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/payments/transactions', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const offset = (page - 1) * limit;
    const status = String(req.query.status || '').trim();

    const where = {};
    if (status) where.status = status;

    const { rows, count } = await Order.findAndCountAll({
      where,
      attributes: ['id', 'buyer_email', 'buyer_name', 'status', 'subtotal_cents', 'total_cents', 'stripe_payment_intent_id', 'stripe_charge_id', 'photographer_id', 'created_at'],
      include: [{ model: User, as: 'photographer', attributes: ['id', 'email', 'username'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    const paidTotal = await Order.sum('total_cents', { where: { status: 'paid' } });

    res.json({
      items: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      paidRevenueCents: Number(paidTotal || 0),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/payments/transactions/:id', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'photographer', attributes: ['id', 'email', 'username'] },
        { model: OrderItem, include: [{ model: Photo, attributes: ['id', 'title'] }] },
      ],
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const meta = parseOrderMeta(order);
    res.json({
      order,
      timeline: timelineForOrder(order),
      refunds: meta.refunds || [],
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/payments/transactions/:id/status', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const status = String(req.body?.status || '').trim();
    if (!ADMIN_ORDER_STATUSES.has(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const prevStatus = order.status;
    await order.update({ status });
    await appendOrderTimelineEvent(order, {
      type: 'admin_status_updated',
      title: `Admin updated status to ${status}`,
      description: `Changed from ${prevStatus} to ${status}`,
      status,
      previous_status: prevStatus,
      admin_user_id: req.user.id,
    });

    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.patch('/payments/transactions/:id/shipping', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const shipping_carrier = req.body.shipping_carrier ? String(req.body.shipping_carrier).trim() : null;
    const tracking_number = req.body.tracking_number ? String(req.body.tracking_number).trim() : null;
    const estimated_delivery = req.body.estimated_delivery ? new Date(req.body.estimated_delivery) : null;
    if (estimated_delivery && Number.isNaN(estimated_delivery.getTime())) {
      return res.status(400).json({ error: 'Invalid estimated_delivery value' });
    }

    const markShipped = req.body.mark_shipped === true;
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
      type: 'admin_shipping_updated',
      title: markShipped ? 'Admin marked order shipped' : 'Admin updated shipping',
      description: tracking_number ? `Tracking ${tracking_number}${shipping_carrier ? ` via ${shipping_carrier}` : ''}` : 'Shipping details updated',
      status: order.status,
      shipping_carrier: order.shipping_carrier,
      tracking_number: order.tracking_number,
      estimated_delivery: order.estimated_delivery,
      shipped_at: order.shipped_at,
      admin_user_id: req.user.id,
    });

    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.post('/payments/transactions/:id/refunds', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    return res.status(410).json({ error: 'Stripe refunds are disabled in this deployment' });

    const paymentRef = order.stripe_charge_id || order.stripe_payment_intent_id;
    if (!paymentRef) {
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

    const refundPayload = {
      amount: amount_cents,
      metadata: {
        order_id: String(order.id),
        admin_user_id: String(req.user.id),
      },
    };
    if (order.stripe_charge_id) refundPayload.charge = order.stripe_charge_id;
    else refundPayload.payment_intent = order.stripe_payment_intent_id;
    const reason = mapStripeRefundReason(req.body?.reason);
    if (reason) refundPayload.reason = reason;

    const refund = { id: `refund-${Date.now()}`, status: 'disabled' };

    await updateOrderMeta(order, (meta) => {
      const refunds = Array.isArray(meta.refunds) ? meta.refunds : [];
      refunds.push({
        id: refund.id,
        amount_cents,
        reason: req.body?.reason || 'other',
        notes: req.body?.notes || null,
        status: refund.status || 'pending',
        created_at: new Date().toISOString(),
        created_by_admin_id: req.user.id,
      });
      meta.refunds = refunds;
      return meta;
    });

    await appendOrderTimelineEvent(order, {
      type: 'admin_refund_created',
      title: 'Admin issued refund',
      description: `Refund ${refund.id} created for ${(amount_cents / 100).toFixed(2)} USD`,
      status: order.status,
      refund_id: refund.id,
      amount_cents,
      reason: req.body?.reason || 'other',
      admin_user_id: req.user.id,
    });

    res.status(201).json({
      refund: {
        id: refund.id,
        amount_cents,
        status: refund.status || 'pending',
      },
      refunded_total_cents: refundedTotalCents(order),
      refundable_remaining_cents: Math.max(0, Number(order.total_cents || 0) - refundedTotalCents(order)),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/billing/stripe-linkage', async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      include: [{ model: User, attributes: ['id', 'email', 'username'] }],
      order: [['created_at', 'DESC']],
    });

    const missing = plans.filter((p) => !p.stripe_product_id || !p.stripe_price_id);
    const invalidShape = plans.filter((p) => !p.name || !p.price_cents || Number(p.price_cents) < 100);

    res.json({
      totals: {
        plans: plans.length,
        missingStripeLinkage: missing.length,
        invalidPriceShape: invalidShape.length,
      },
      items: missing.slice(0, 200).map((p) => ({
        id: p.id,
        name: p.name,
        price_cents: p.price_cents,
        billing_period: p.billing_period,
        stripe_product_id: p.stripe_product_id || null,
        stripe_price_id: p.stripe_price_id || null,
        is_active: p.is_active,
        user: p.User ? {
          id: p.User.id,
          email: p.User.email,
          username: p.User.username,
        } : null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/system/overview', async (req, res, next) => {
  try {
    const rate = getRateAnalytics();
    const statusCounts = rate.statusCounts || {};
    const errorResponses = Object.entries(statusCounts)
      .filter(([code]) => String(code).startsWith('5'))
      .reduce((sum, [, count]) => sum + Number(count || 0), 0);

    let db = 'ok';
    try {
      await sequelize.authenticate();
    } catch {
      db = 'error';
    }

    res.json({
      runtime: {
        env: process.env.NODE_ENV || 'development',
        node: process.version,
        uptimeSec: Math.round(process.uptime()),
        memory: process.memoryUsage(),
      },
      health: {
        database: db,
      },
      monitoring: {
        requestCount: rate.requestCount || 0,
        avgLatencyMs: rate.avgLatencyMs || 0,
        errorResponses,
        methodCounts: rate.methodCounts || {},
        statusCounts,
      },
      logsHint: 'Use hosting provider logs (Render) and Sentry for deep error traces.',
    });
  } catch (err) {
    next(err);
  }
});

router.get('/sentry-test', (req, res, next) => {
  const enabled = String(process.env.ENABLE_SENTRY_TEST_ROUTE || 'false').toLowerCase() === 'true';
  if (!enabled) {
    return res.status(404).json({ error: 'Not found' });
  }

  const err = new Error('Sentry test error triggered by admin route');
  err.status = 500;
  next(err);
});

module.exports = router;
