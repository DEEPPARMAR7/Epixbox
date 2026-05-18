const router = require('express').Router();
const logger = require('../config/logger');
const { sendPasswordResetEmail } = require('../services/email.service');

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

module.exports = router;
