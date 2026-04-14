const express = require('express');
const { Op } = require('sequelize');
const { Order, OrderItem, Photo, Gallery, User } = require('../models');
const requireAuth = require('../middleware/auth.middleware');
const sequelize = require('../config/database');

const router = express.Router();

// GET revenue summary
router.get('/revenue-summary', requireAuth, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = { photographer_id: req.user.id, status: 'paid' };
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const orders = await Order.findAll({ where });

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_cents || 0), 0);
    const count = orders.length;
    const avgOrderValue = count > 0 ? Math.round(totalRevenue / count) : 0;

    res.json({
      total_revenue_cents: totalRevenue,
      order_count: count,
      avg_order_value_cents: avgOrderValue,
    });
  } catch (error) {
    next(error);
  }
});

// GET customer insights
router.get('/customer-insights', requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { photographer_id: req.user.id, status: 'paid' },
    });

    // Group by customer email
    const customerMap = {};
    orders.forEach((order) => {
      if (!customerMap[order.buyer_email]) {
        customerMap[order.buyer_email] = {
          email: order.buyer_email,
          name: order.buyer_name,
          orders: [],
          total_spent_cents: 0,
        };
      }
      customerMap[order.buyer_email].orders.push(order);
      customerMap[order.buyer_email].total_spent_cents += order.total_cents || 0;
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
    next(error);
  }
});

// GET sales by product
router.get('/product-sales', requireAuth, async (req, res, next) => {
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
router.get('/gallery-sales', requireAuth, async (req, res, next) => {
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
router.post('/export-report', requireAuth, async (req, res, next) => {
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
