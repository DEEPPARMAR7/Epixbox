const router = require('express').Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3Client = require('../config/s3');
const stripe = require('../config/stripe');
const { User, CustomDomain } = require('../models/index');
const requireAuth = require('../middleware/auth.middleware');
const { requireFeature } = require('../middleware/featureGate.middleware');
const { getTierLimits } = require('../utils/subscriptionTiers');
const crypto = require('crypto');

router.use(requireAuth);

// GET /api/settings/profile
router.get('/profile', (req, res) => {
  res.json(req.user);
});

// PUT /api/settings/profile
router.put('/profile', async (req, res, next) => {
  try {
    const { first_name, last_name, bio, website_url, brand_name, brand_color } = req.body;
    await req.user.update({ first_name, last_name, bio, website_url, brand_name, brand_color });
    res.json(req.user);
  } catch (err) { next(err); }
});

// PUT /api/settings/password
router.put('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    const password_hash = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash });
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
});

// POST /api/settings/avatar — upload avatar
const avatarUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME || 'photoapp-bucket',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => cb(null, `avatars/${req.user.id}/avatar.jpg`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('avatar');

router.post('/avatar', (req, res, next) => {
  avatarUpload(req, res, async (err) => {
    if (err) return next(err);
    try {
      const cdnDomain = process.env.CLOUDFRONT_DOMAIN;
      const avatarUrl = cdnDomain
        ? `${cdnDomain}/avatars/${req.user.id}/avatar.jpg`
        : req.file.location;
      await req.user.update({ avatar_url: avatarUrl });
      res.json({ avatar_url: avatarUrl });
    } catch (err) { next(err); }
  });
});

// POST /api/settings/domain
router.post('/domain', requireFeature(async ({ limits }) => ({
  allowed: limits.canCustomDomain,
  message: 'Custom domain is available on Pro and Business plans only.',
})), async (req, res, next) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: 'Domain is required' });
    const verification_token = crypto.randomBytes(16).toString('hex');
    const [customDomain, created] = await CustomDomain.findOrCreate({
      where: { user_id: req.user.id },
      defaults: { domain, verification_token },
    });
    if (!created) await customDomain.update({ domain, is_verified: false, verification_token });
    res.json(customDomain);
  } catch (err) { next(err); }
});

// GET /api/settings/billing
router.get('/billing', async (req, res, next) => {
  try {
    const limits = getTierLimits(req.user.plan);
    res.json({ plan: req.user.plan, stripe_customer_id: req.user.stripe_customer_id, tier_limits: limits });
  } catch (err) { next(err); }
});

// POST /api/settings/billing/portal
router.post('/billing/portal', async (req, res, next) => {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    if (!stripeSecretKey || !/^(sk_test_|sk_live_)/.test(stripeSecretKey)) {
      return res.status(500).json({ error: 'Stripe is not configured on the server.' });
    }

    let stripeCustomerId = req.user.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: [req.user.first_name, req.user.last_name].filter(Boolean).join(' ').trim() || undefined,
        metadata: {
          user_id: String(req.user.id),
          username: req.user.username || '',
          created_from: 'billing_portal',
        },
      });

      stripeCustomerId = customer.id;
      await req.user.update({ stripe_customer_id: stripeCustomerId });
    }

    const sessionConfig = {
      customer: stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard/settings`,
    };

    if (process.env.STRIPE_PORTAL_CONFIG_ID) {
      sessionConfig.configuration = process.env.STRIPE_PORTAL_CONFIG_ID;
    }

    const session = await stripe.billingPortal.sessions.create(sessionConfig);

    console.log('Stripe billing portal created', { customer: stripeCustomerId, url: session.url });
    res.json({ url: session.url });
  } catch (err) {
    if (err?.type === 'StripeAuthenticationError' || err?.code === 'authentication_error') {
      console.error('Stripe authentication failure:', err.message);
      return res.status(500).json({ error: 'Stripe API key is invalid or not configured properly.' });
    }
    next(err);
  }
});

// GET /api/settings/billing/portal-config-info
// Helper endpoint to check Stripe portal configuration
router.get('/billing/portal-config-info', requireAuth, async (req, res) => {
  try {
    if (req.userRole !== 'admin' && req.userRole !== 'photographer') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    if (!stripeSecretKey || !/^(sk_test_|sk_live_)/.test(stripeSecretKey)) {
      return res.json({ configured: false, message: 'Stripe not configured' });
    }

    const configId = process.env.STRIPE_PORTAL_CONFIG_ID;
    if (!configId) {
      return res.json({
        configured: false,
        message: 'Stripe portal not configured. Set STRIPE_PORTAL_CONFIG_ID in .env',
        help: 'Configure portal at: https://dashboard.stripe.com/settings/billing/portal',
      });
    }

    res.json({
      configured: true,
      configId,
      message: 'Stripe portal is configured',
    });
  } catch (err) {
    console.error('Portal config info error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
