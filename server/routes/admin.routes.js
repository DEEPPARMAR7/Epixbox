const router = require('express').Router();
const { Op } = require('sequelize');
const requireAuth = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { User, Gallery, Photo, Order } = require('../models/index');
const { getRateAnalytics } = require('../services/rateAnalytics.service');

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
