const express = require('express');
const { Op } = require('sequelize');
const requireAuth = require('../middleware/auth.middleware');
const { SubscriptionPlan, Subscription, User, Gallery } = require('../models/index');
const { getTierLimits } = require('../utils/subscriptionTiers');
const { sendSubscriptionWelcomeEmail, sendTrialEndingReminderEmail } = require('../services/email.service');

const router = express.Router();

function subscriptionPaymentsDisabled(res) {
  return res.status(410).json({
    error: 'Subscription payment management is disabled in this deployment',
  });
}

function parseBillingPeriod(period) {
  const normalized = String(period || '').toLowerCase();
  if (normalized === 'yearly' || normalized === 'annual') return 'yearly';
  return 'monthly';
}

function cents(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return NaN;
  return Math.round(parsed);
}

function asDate(unixSeconds) {
  if (!unixSeconds) return null;
  return new Date(Number(unixSeconds) * 1000);
}

async function findOrCreateStripeCustomer() {
  throw new Error('Subscription payment management is disabled in this deployment');
}

async function resolvePlanStripeLink(plan) {
  return {
    needsMigration: false,
    stripe_product_id: null,
    stripe_price_id: null,
    reason: 'payment_management_removed',
  };
}

// ----- Public browsing endpoints (no auth required) -----

// GET /api/subscriptions/browse (public - all active plans)
router.get('/browse', async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { is_active: true },
      include: [{
        model: User,
        attributes: ['id', 'username', 'brand_name', 'email'],
      }],
      attributes: ['id', 'user_id', 'name', 'description', 'price_cents', 'billing_period', 'trial_days', 'features', 'created_at'],
      order: [['price_cents', 'ASC']],
    });

    // Group by photographer or return flat list
    const groupByPhotographer = req.query.groupBy === 'photographer';
    
    if (groupByPhotographer) {
      const grouped = {};
      plans.forEach(plan => {
        const username = plan.User?.username || 'unknown';
        if (!grouped[username]) {
          grouped[username] = {
            photographer: {
              id: plan.User?.id,
              username: plan.User?.username,
              brand_name: plan.User?.brand_name,
            },
            plans: [],
          };
        }
        grouped[username].plans.push({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price_cents: plan.price_cents,
          billing_period: plan.billing_period,
          trial_days: plan.trial_days,
          features: plan.features,
        });
      });
      res.json(Object.values(grouped));
    } else {
      res.json({
        total: plans.length,
        plans: plans.map(p => ({
          id: p.id,
          photographer: {
            id: p.User?.id,
            username: p.User?.username,
            brand_name: p.User?.brand_name,
          },
          name: p.name,
          description: p.description,
          price_cents: p.price_cents,
          billing_period: p.billing_period,
          trial_days: p.trial_days,
          features: p.features,
        })),
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/subscriptions/browse/:username (public - plans for specific photographer)
router.get('/browse/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      attributes: ['id', 'username', 'brand_name'],
    });
    if (!user) return res.status(404).json({ error: 'Photographer not found' });

    const plans = await SubscriptionPlan.findAll({
      where: { user_id: user.id, is_active: true },
      attributes: ['id', 'name', 'description', 'price_cents', 'billing_period', 'trial_days', 'features'],
      order: [['price_cents', 'ASC']],
    });

    res.json({
      photographer: {
        username: user.username,
        brand_name: user.brand_name,
      },
      total: plans.length,
      plans,
    });
  } catch (error) {
    next(error);
  }
});

// ----- Photographer plan management -----

// GET /api/subscriptions/plans (photographer)
router.get('/plans', requireAuth, async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// GET /api/subscriptions/plans/migration-audit (photographer)
router.get('/plans/migration-audit', requireAuth, async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });

    res.json({
      total: plans.length,
      missing: 0,
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        is_active: plan.is_active,
        needsMigration: false,
        reason: 'payment_management_removed',
      })),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/plans/migrate-stripe (photographer)
router.post('/plans/migrate-stripe', requireAuth, async (req, res, next) => {
  return subscriptionPaymentsDisabled(res);
});

// POST /api/subscriptions/plans (photographer)
router.post('/plans', requireAuth, async (req, res, next) => {
  try {
    return subscriptionPaymentsDisabled(res);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/subscriptions/plans/:id (photographer)
router.patch('/plans/:id', requireAuth, async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const updates = {};
    if (typeof req.body.name === 'string' && req.body.name.trim()) updates.name = req.body.name.trim();
    if (typeof req.body.description === 'string') updates.description = req.body.description;
    if (typeof req.body.features === 'object' && req.body.features) updates.features = req.body.features;
    if (typeof req.body.is_active === 'boolean') updates.is_active = req.body.is_active;
    if (req.body.trial_days != null) updates.trial_days = Math.max(0, Math.min(Number(req.body.trial_days || 0), 30));

    if (req.body.price_cents != null || req.body.billing_period) {
      return subscriptionPaymentsDisabled(res);
    }

    await plan.update(updates);
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/subscriptions/plans/:id (soft deactivate)
router.delete('/plans/:id', requireAuth, async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    await plan.update({ is_active: false });
    res.json({ message: 'Plan deactivated' });
  } catch (error) {
    next(error);
  }
});

// GET /api/subscriptions/analytics (photographer)
router.get('/analytics', requireAuth, async (req, res, next) => {
  try {
    const planIds = (await SubscriptionPlan.findAll({ where: { user_id: req.user.id }, attributes: ['id', 'price_cents'] }))
      .map((p) => ({ id: p.id, price_cents: p.price_cents }));

    const ids = planIds.map((p) => p.id);
    if (!ids.length) {
      return res.json({
        totals: { active: 0, trialing: 0, canceled: 0, total: 0 },
        mrr_cents: 0,
        churn_rate_30d: 0,
      });
    }

    const subs = await Subscription.findAll({ where: { plan_id: { [Op.in]: ids } } });
    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const priceMap = new Map(planIds.map((p) => [String(p.id), Number(p.price_cents || 0)]));
    const active = subs.filter((s) => s.status === 'active');
    const trialing = subs.filter((s) => s.status === 'trialing');
    const canceled = subs.filter((s) => s.status === 'canceled');

    const mrrCents = [...active, ...trialing].reduce((sum, s) => sum + (priceMap.get(String(s.plan_id)) || 0), 0);
    const canceled30d = canceled.filter((s) => s.canceled_at && new Date(s.canceled_at).getTime() >= monthAgo).length;
    const activeBase = Math.max(active.length + trialing.length + canceled30d, 1);
    const churnRate = Number(((canceled30d / activeBase) * 100).toFixed(2));

    res.json({
      totals: {
        active: active.length,
        trialing: trialing.length,
        canceled: canceled.length,
        total: subs.length,
      },
      mrr_cents: mrrCents,
      churn_rate_30d: churnRate,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/subscriptions/feature-gates (current photographer account)
router.get('/feature-gates', requireAuth, async (req, res, next) => {
  try {
    const limits = getTierLimits(req.user.plan);
    const galleriesCount = await Gallery.count({ where: { user_id: req.user.id } });

    res.json({
      tier: limits.tier,
      limits,
      usage: {
        galleries: galleriesCount,
      },
      remaining: {
        galleries: Math.max(0, limits.maxGalleries - galleriesCount),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ----- Public customer flows -----

// GET /api/subscriptions/public/:username/plans
router.get('/public/:username/plans', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { username: req.params.username }, attributes: ['id', 'username', 'brand_name'] });
    if (!user) return res.status(404).json({ error: 'Photographer not found' });

    const plans = await SubscriptionPlan.findAll({
      where: { user_id: user.id, is_active: true },
      attributes: ['id', 'name', 'description', 'price_cents', 'billing_period', 'trial_days', 'features'],
      order: [['price_cents', 'ASC']],
    });

    res.json({
      photographer: {
        username: user.username,
        brand_name: user.brand_name,
      },
      plans,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/checkout-session
router.post('/checkout-session', async (req, res, next) => {
  // Subscriptions via Stripe are disabled on this server.
  return res.status(400).json({ error: 'Stripe subscriptions are disabled on this server.' });
});

// GET /api/subscriptions/customer
router.get('/customer', async (req, res, next) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    const username = String(req.query.username || '').trim().toLowerCase();
    if (!email || !username) {
      return res.status(400).json({ error: 'email and username are required' });
    }

    const photographer = await User.findOne({ where: { username }, attributes: ['id', 'username', 'brand_name'] });
    if (!photographer) return res.status(404).json({ error: 'Photographer not found' });

    const subscriptions = await Subscription.findAll({
      where: {
        customer_email: email,
        photographer_user_id: photographer.id,
      },
      include: [{ model: SubscriptionPlan, attributes: ['id', 'name', 'price_cents', 'billing_period'] }],
      order: [['created_at', 'DESC']],
    });

    const withTrial = subscriptions.map((sub) => {
      const trialEnd = sub.trial_end ? new Date(sub.trial_end).getTime() : null;
      const daysRemaining = trialEnd ? Math.max(0, Math.ceil((trialEnd - Date.now()) / (24 * 60 * 60 * 1000))) : 0;
      return {
        ...sub.toJSON(),
        trial_days_remaining: daysRemaining,
      };
    });

    res.json({ photographer, subscriptions: withTrial });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/customer/portal
router.post('/customer/portal', async (req, res, next) => {
  try {
    return subscriptionPaymentsDisabled(res);
  } catch (error) {
    next(error);
  }
});

// ----- Stripe webhook for recurring billing -----

router.post('/webhook', async (req, res) => {
  res.status(410).json({ error: 'Subscription payment webhooks are disabled on this server.' });
});

module.exports = router;
