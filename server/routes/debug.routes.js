const router = require('express').Router();
const logger = require('../config/logger');
const { sendPasswordResetEmail } = require('../services/email.service');
const requireAuth = require('../middleware/auth.middleware');

// Protected debug route to test email sending from the running server.
// Requires header `X-Debug-Key: <DEBUG_EMAIL_API_KEY>` to run.
router.post('/send-test-email', async (req, res) => {
  const debugKey = req.get('X-Debug-Key');
  if (!process.env.DEBUG_EMAIL_API_KEY) {
    return res.status(403).json({ error: 'Email debug endpoint not enabled on this server' });
  }
  if (!debugKey || debugKey !== process.env.DEBUG_EMAIL_API_KEY) {
    return res.status(401).json({ error: 'Invalid debug key' });
  }

  try {
    const to = req.body?.to || process.env.EMAIL_FROM || process.env.SMTP_USER;
    if (!to) return res.status(400).json({ error: 'Recipient email required' });

    const dummyToken = 'debug-token-' + Date.now();
    const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(dummyToken)}`;

    await sendPasswordResetEmail({ to, resetLink });
    logger.info('Debug test email sent', { to, resetLinkLength: resetLink.length });
    res.json({ message: 'Test email sent', to });
  } catch (err) {
    logger.error('Debug test email failed', { error: err.message, code: err.code });
    res.status(500).json({ error: 'Failed to send test email', details: err.message });
  }
});

// GET /api/debug/stripe-config
// Returns whether a Stripe secret key is configured. If `?probe=true` is provided
// the route will attempt a lightweight Stripe API call to validate the key.
router.get('/stripe-config', requireAuth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    const configured = !!stripeKey && /^(sk_test_|sk_live_)/.test(stripeKey);
    const probeRequested = String(req.query.probe || '').toLowerCase() === 'true';

    if (!configured) {
      return res.json({ configured: false, probe: probeRequested ? 'skipped' : 'not_requested' });
    }

    if (!probeRequested) {
      return res.json({ configured: true, probe: 'not_requested' });
    }

    // Perform a safe, read-only Stripe call to validate the key
    const stripe = require('../config/stripe');
    try {
      await stripe.products.list({ limit: 1 });
      return res.json({ configured: true, probe: 'ok' });
    } catch (err) {
      if (err?.type === 'StripeAuthenticationError' || err?.code === 'authentication_error') {
        logger.error('Stripe authentication failure (debug probe)', { message: err.message });
        return res.json({ configured: false, probe: 'auth_error', message: 'Stripe authentication failed' });
      }
      logger.error('Stripe probe error', { message: err.message });
      return res.json({ configured: true, probe: 'error', message: err.message });
    }
  } catch (err) {
    logger.error('Stripe config debug failed', { error: err.message });
    return res.status(500).json({ error: 'Debug route failed', details: err.message });
  }
});

module.exports = router;
