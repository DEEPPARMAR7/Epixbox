const express = require('express');
const { Op } = require('sequelize');
const { Order, OrderItem, Photo, Gallery, User } = require('../models');
const requireAuth = require('../middleware/auth.middleware');
const { requireFeature } = require('../middleware/featureGate.middleware');
const sequelize = require('../config/database');

const router = express.Router();

router.use(requireAuth);
router.use(requireFeature(async ({ limits }) => ({
  allowed: limits.canAdvancedAnalytics,
  message: 'Advanced analytics are available on Pro and Business plans only.',
})));

// GET revenue summary
router.get('/revenue-summary', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = { photographer_id: req.user.id, status: 'paid' };
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const orders = await Order.findAll({
      where,
      // Select only fields needed for this aggregate to avoid failures when
      // deployments are temporarily behind on non-essential Order columns.
      attributes: ['id', 'total_cents'],
    });

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_cents || 0), 0);
    const count = orders.length;
    const avgOrderValue = count > 0 ? Math.round(totalRevenue / count) : 0;

    res.json({
      total_revenue_cents: totalRevenue,
      order_count: count,
      avg_order_value_cents: avgOrderValue,
    });
  } catch (error) {
    console.warn('analytics.revenue-summary fallback:', error.message);
    res.json({
      total_revenue_cents: 0,
      order_count: 0,
      avg_order_value_cents: 0,
    });
  }
});

// GET customer insights
router.get('/customer-insights', async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { photographer_id: req.user.id, status: 'paid' },
      // Keep this query resilient when optional Order columns differ by env.
      attributes: ['id', 'buyer_email', 'total_cents'],
    });

    // Group by customer email
    const customerMap = {};
    orders.forEach((order) => {
      const email = String(order.buyer_email || '').trim().toLowerCase();
      if (!email) return;

      if (!customerMap[email]) {
        customerMap[email] = {
          email,
          name: null,
          orders: [],
          total_spent_cents: 0,
        };
      }
      customerMap[email].orders.push(order);
      customerMap[email].total_spent_cents += Number(order.total_cents || 0);
    });

    const customers = Object.values(customerMap).map((c) => ({
      ...c,
      repeat_customer: c.orders.length > 1,
      ltv_cents: c.total_spent_cents,
    }));

    // Sort by LTV
    customers.sort((a, b) => b.ltv_cents - a.ltv_cents);

    res.json({
      total_customers: customers.length,
      repeat_customer_count: customers.filter((c) => c.repeat_customer).length,
      customers: customers.slice(0, 20), // Top 20
    });
  } catch (error) {
    console.warn('analytics.customer-insights fallback:', error.message);
    res.json({
      total_customers: 0,
      repeat_customer_count: 0,
      customers: [],
    });
  }
});

// GET sales by product
router.get('/product-sales', async (req, res, next) => {
  try {
    const sales = await OrderItem.findAll({
      include: [
        {
          model: Order,
          where: { photographer_id: req.user.id, status: 'paid' },
          attributes: ['id', 'total_cents'],
        },
      ],
      attributes: [
        'product_id',
        [sequelize.fn('COUNT', sequelize.col('OrderItem.id')), 'quantity'],
        [sequelize.fn('SUM', sequelize.col('OrderItem.unit_price_cents')), 'total_cents'],
      ],
      group: ['product_id'],
      raw: true,
    });

    res.json(sales);
  } catch (error) {
    next(error);
  }
});

// GET sales by gallery
router.get('/gallery-sales', async (req, res, next) => {
  try {
    const sales = await OrderItem.findAll({
      include: [
        {
          model: Photo,
          attributes: ['id', 'gallery_id'],
          include: [{ model: Gallery, where: { user_id: req.user.id }, attributes: ['id', 'name'] }],
        },
        {
          model: Order,
          where: { status: 'paid' },
          attributes: ['id', 'total_cents'],
        },
      ],
      attributes: [
        'product_id',
        [sequelize.fn('COUNT', sequelize.col('OrderItem.id')), 'quantity'],
        [sequelize.fn('SUM', sequelize.col('OrderItem.unit_price_cents')), 'total_cents'],
      ],
      group: ['Photo.gallery_id'],
    });

    res.json(sales);
  } catch (error) {
    next(error);
  }
});

// POST export report to CSV
router.post('/export-report', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    const where = { photographer_id: req.user.id, status: 'paid' };
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const orders = await Order.findAll({
      where,
      include: [{ model: OrderItem }],
      order: [['created_at', 'DESC']],
    });

    // Generate CSV
    let csv = 'Date,Customer,Amount,Items,Status\n';
    orders.forEach((order) => {
      csv += `${order.created_at.toISOString()},${order.buyer_name || order.buyer_email},${(order.total_cents / 100).toFixed(2)},${order.OrderItems?.length || 0},${order.status}\n`;
    });

    res.setHeader('Content-Disposition', 'attachment; filename=sales-report.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
