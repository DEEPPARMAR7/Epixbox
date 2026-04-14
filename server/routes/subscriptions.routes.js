const express = require('express');
const { SubscriptionPlan, Subscription } = require('../models');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

// POST create subscription plan
router.post('/plans', requireAuth, async (req, res, next) => {
  try {
    const { stripe_price_id, name, price_cents, billing_period, trial_days, features } = req.body;

    if (!stripe_price_id || !name || !price_cents) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const plan = await SubscriptionPlan.create({
      user_id: req.user.id,
      stripe_price_id,
      name,
      price_cents,
      billing_period,
      trial_days,
      features,
    });

    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
});

// GET all plans for user
router.get('/plans', requireAuth, async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { user_id: req.user.id, is_active: true },
    });
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// GET all active subscriptions for a plan
router.get('/plans/:planId/subscriptions', requireAuth, async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findOne({
      where: { id: req.params.planId, user_id: req.user.id },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const subscriptions = await Subscription.findAll({
      where: { plan_id: plan.id, status: 'active' },
    });

    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
});

// POST create customer subscription
router.post('/subscribe', async (req, res, next) => {
  try {
    const { stripe_subscription_id, stripe_customer_id, plan_id, customer_email, current_period_start, current_period_end } = req.body;

    if (!stripe_subscription_id || !stripe_customer_id || !plan_id || !customer_email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const subscription = await Subscription.create({
      plan_id,
      stripe_subscription_id,
      stripe_customer_id,
      customer_email,
      current_period_start,
      current_period_end,
      status: 'active',
    });

    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
});

// PATCH cancel subscription
router.patch('/subscriptions/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const { cancel_reason } = req.body;

    const subscription = await Subscription.findByPk(req.params.id, {
      include: [{ model: SubscriptionPlan, where: { user_id: req.user.id } }],
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await subscription.update({
      status: 'canceled',
      canceled_at: new Date(),
      cancel_reason,
    });

    res.json(subscription);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
