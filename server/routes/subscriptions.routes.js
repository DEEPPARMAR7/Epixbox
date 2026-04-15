const express = require('express');
const { Op } = require('sequelize');
const stripe = require('../config/stripe');
const requireAuth = require('../middleware/auth.middleware');
const { SubscriptionPlan, Subscription, User, Gallery } = require('../models/index');
const { getTierLimits } = require('../utils/subscriptionTiers');

const router = express.Router();

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

async function findOrCreateStripeCustomer({ email, photographerUserId }) {
  const result = await stripe.customers.list({ email, limit: 1 });
  const existing = result?.data?.[0];
  if (existing) return existing;

  return stripe.customers.create({
    email,
    metadata: {
      type: 'epicbox_subscription_customer',
      photographer_user_id: String(photographerUserId),
    },
  });
}

async function resolvePlanStripeLink(plan) {
  const result = {
    needsMigration: false,
    stripe_product_id: plan.stripe_product_id || null,
    stripe_price_id: plan.stripe_price_id || null,
    reason: null,
  };

  if (!plan.stripe_price_id && !plan.stripe_product_id) {
    result.needsMigration = true;
    result.reason = 'missing_price_and_product';
    return result;
  }

  if (plan.stripe_price_id) {
    try {
      const stripePrice = await stripe.prices.retrieve(plan.stripe_price_id);
      result.stripe_price_id = stripePrice.id;
      result.stripe_product_id = typeof stripePrice.product === 'string' ? stripePrice.product : stripePrice.product?.id;
      return result;
    } catch {
      result.needsMigration = true;
      result.reason = 'invalid_price_id';
      return result;
    }
  }

  result.needsMigration = true;
  result.reason = 'missing_price_id';
  return result;
}

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

    const results = [];
    for (const plan of plans) {
      const link = await resolvePlanStripeLink(plan);
      results.push({
        id: plan.id,
        name: plan.name,
        is_active: plan.is_active,
        ...link,
      });
    }

    res.json({
      total: results.length,
      missing: results.filter((r) => r.needsMigration).length,
      plans: results,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/plans/migrate-stripe (photographer)
router.post('/plans/migrate-stripe', requireAuth, async (req, res, next) => {
  try {
    const dryRun = req.body?.dryRun !== false;
    const includeInactive = req.body?.includeInactive === true;

    const where = { user_id: req.user.id };
    if (!includeInactive) where.is_active = true;

    const plans = await SubscriptionPlan.findAll({ where, order: [['created_at', 'ASC']] });
    const summary = {
      scanned: plans.length,
      migrated: 0,
      alreadyValid: 0,
      failed: 0,
      dryRun,
      details: [],
    };

    for (const plan of plans) {
      try {
        const link = await resolvePlanStripeLink(plan);
        if (!link.needsMigration) {
          if (!dryRun && (plan.stripe_product_id !== link.stripe_product_id || plan.stripe_price_id !== link.stripe_price_id)) {
            await plan.update({
              stripe_product_id: link.stripe_product_id,
              stripe_price_id: link.stripe_price_id,
            });
          }

          summary.alreadyValid += 1;
          summary.details.push({ id: plan.id, name: plan.name, status: 'valid', ...link });
          continue;
        }

        if (dryRun) {
          summary.migrated += 1;
          summary.details.push({ id: plan.id, name: plan.name, status: 'would_migrate', reason: link.reason });
          continue;
        }

        const product = await stripe.products.create({
          name: plan.name,
          description: plan.description || undefined,
          metadata: {
            photographer_user_id: String(plan.user_id),
            plan_id: String(plan.id),
            migration: 'true',
          },
        });

        const amount = Number(plan.price_cents || 0);
        if (!Number.isFinite(amount) || amount < 100) {
          throw new Error('Invalid plan price_cents for migration');
        }

        const interval = parseBillingPeriod(plan.billing_period) === 'yearly' ? 'year' : 'month';
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: amount,
          currency: 'usd',
          recurring: { interval },
          metadata: {
            photographer_user_id: String(plan.user_id),
            plan_id: String(plan.id),
            migration: 'true',
          },
        });

        await plan.update({ stripe_product_id: product.id, stripe_price_id: price.id });
        summary.migrated += 1;
        summary.details.push({ id: plan.id, name: plan.name, status: 'migrated', stripe_product_id: product.id, stripe_price_id: price.id });
      } catch (err) {
        summary.failed += 1;
        summary.details.push({ id: plan.id, name: plan.name, status: 'failed', error: err.message });
      }
    }

    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/plans (photographer)
router.post('/plans', requireAuth, async (req, res, next) => {
  try {
    const tier = getTierLimits(req.user.plan);
    const activeCount = await SubscriptionPlan.count({ where: { user_id: req.user.id, is_active: true } });
    if (activeCount >= tier.maxActivePlans) {
      return res.status(403).json({
        error: `Your ${tier.label} plan allows up to ${tier.maxActivePlans} active subscription plans.`,
      });
    }

    const {
      name,
      description,
      price_cents,
      billing_period,
      trial_days = 0,
      features = {},
      is_active = true,
    } = req.body;

    const amount = cents(price_cents);
    if (!name || !Number.isFinite(amount) || amount < 100) {
      return res.status(400).json({ error: 'name and valid price_cents (>=100) are required' });
    }

    const period = parseBillingPeriod(billing_period);

    const product = await stripe.products.create({
      name,
      description: description || undefined,
      metadata: {
        photographer_user_id: String(req.user.id),
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount,
      currency: 'usd',
      recurring: { interval: period === 'yearly' ? 'year' : 'month' },
      metadata: {
        photographer_user_id: String(req.user.id),
      },
    });

    const plan = await SubscriptionPlan.create({
      user_id: req.user.id,
      stripe_product_id: product.id,
      stripe_price_id: price.id,
      name,
      description: description || null,
      price_cents: amount,
      billing_period: period,
      trial_days: Math.max(0, Math.min(Number(trial_days || 0), 30)),
      features,
      is_active: Boolean(is_active),
    });

    res.status(201).json(plan);
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

    if (req.body.price_cents != null) {
      const amount = cents(req.body.price_cents);
      if (!Number.isFinite(amount) || amount < 100) {
        return res.status(400).json({ error: 'price_cents must be >= 100' });
      }

      const period = parseBillingPeriod(req.body.billing_period || plan.billing_period);
      const newPrice = await stripe.prices.create({
        product: plan.stripe_product_id,
        unit_amount: amount,
        currency: 'usd',
        recurring: { interval: period === 'yearly' ? 'year' : 'month' },
        metadata: {
          photographer_user_id: String(req.user.id),
          replaces_plan_id: String(plan.id),
        },
      });

      updates.price_cents = amount;
      updates.billing_period = period;
      updates.stripe_price_id = newPrice.id;
    } else if (req.body.billing_period) {
      updates.billing_period = parseBillingPeriod(req.body.billing_period);
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
  try {
    const { planId, customerEmail, successUrl, cancelUrl } = req.body;
    if (!planId || !customerEmail || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'planId, customerEmail, successUrl, and cancelUrl are required' });
    }

    const plan = await SubscriptionPlan.findOne({ where: { id: planId, is_active: true } });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const customer = await findOrCreateStripeCustomer({
      email: String(customerEmail).trim().toLowerCase(),
      photographerUserId: plan.user_id,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: plan.trial_days || undefined,
        metadata: {
          plan_id: String(plan.id),
          photographer_user_id: String(plan.user_id),
          customer_email: String(customerEmail).trim().toLowerCase(),
        },
      },
      metadata: {
        plan_id: String(plan.id),
        photographer_user_id: String(plan.user_id),
        customer_email: String(customerEmail).trim().toLowerCase(),
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    next(error);
  }
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
    const { subscriptionId, customerEmail, returnUrl } = req.body;
    if (!subscriptionId || !customerEmail || !returnUrl) {
      return res.status(400).json({ error: 'subscriptionId, customerEmail, and returnUrl are required' });
    }

    const sub = await Subscription.findByPk(subscriptionId);
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    if (String(sub.customer_email || '').toLowerCase() !== String(customerEmail).trim().toLowerCase()) {
      return res.status(403).json({ error: 'Subscription/email mismatch' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

// ----- Stripe webhook for recurring billing -----

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.mode === 'subscription' && session.subscription) {
        const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
        const planId = stripeSub.metadata?.plan_id || session.metadata?.plan_id;
        const photographerUserId = stripeSub.metadata?.photographer_user_id || session.metadata?.photographer_user_id;
        const customerEmail = (stripeSub.metadata?.customer_email || session.metadata?.customer_email || session.customer_details?.email || '').toLowerCase();

        if (planId && photographerUserId && customerEmail) {
          await Subscription.upsert({
            plan_id: planId,
            photographer_user_id: photographerUserId,
            stripe_subscription_id: stripeSub.id,
            stripe_customer_id: stripeSub.customer,
            customer_email: customerEmail,
            status: stripeSub.status,
            current_period_start: asDate(stripeSub.current_period_start),
            current_period_end: asDate(stripeSub.current_period_end),
            trial_start: asDate(stripeSub.trial_start),
            trial_end: asDate(stripeSub.trial_end),
            canceled_at_period_end: Boolean(stripeSub.cancel_at_period_end),
            canceled_at: asDate(stripeSub.canceled_at),
            latest_invoice_id: stripeSub.latest_invoice || null,
          });
        }
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const stripeSub = event.data.object;
      const local = await Subscription.findOne({ where: { stripe_subscription_id: stripeSub.id } });
      if (local) {
        await local.update({
          status: stripeSub.status,
          current_period_start: asDate(stripeSub.current_period_start),
          current_period_end: asDate(stripeSub.current_period_end),
          trial_start: asDate(stripeSub.trial_start),
          trial_end: asDate(stripeSub.trial_end),
          canceled_at_period_end: Boolean(stripeSub.cancel_at_period_end),
          canceled_at: asDate(stripeSub.canceled_at),
          latest_invoice_id: stripeSub.latest_invoice || null,
        });
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      if (invoice.subscription) {
        const local = await Subscription.findOne({ where: { stripe_subscription_id: invoice.subscription } });
        if (local) {
          await local.update({
            status: 'active',
            latest_invoice_id: invoice.id,
          });
        }
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      if (invoice.subscription) {
        const local = await Subscription.findOne({ where: { stripe_subscription_id: invoice.subscription } });
        if (local) {
          await local.update({
            status: 'past_due',
            latest_invoice_id: invoice.id,
          });
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Webhook processing failed' });
  }
});

module.exports = router;
