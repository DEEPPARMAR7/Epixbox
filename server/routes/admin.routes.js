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

module.exports = router;
