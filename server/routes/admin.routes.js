const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op, fn, col } = require('sequelize');
const requireAuth = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { User, Gallery, Photo, Order, sequelize } = require('../models/index');
const { getRateAnalytics } = require('../services/rateAnalytics.service');
const { deleteFile } = require('../services/s3.service');

router.use(requireAuth, requireRole('admin'));

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
