const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT) || 2525,
  // Gmail and most providers require secure TLS
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports (TLS will be upgraded)
  requireTLS: true, // Force TLS upgrade for port 587
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  // Gmail specific settings
  pool: {
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 10,
  },
});

// Test SMTP connection on startup
transporter.verify((err, success) => {
  if (err) {
    logger.error('❌ SMTP connection failed on startup', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'NOT SET',
      error: err.message,
      code: err.code,
      command: err.command,
      responseCode: err.responseCode,
      secure: process.env.SMTP_PORT === '465',
      requireTLS: true,
      notes: 'For Gmail: Use App Password (not account password). Enable "Less secure app access" or use OAuth2.',
    });
  } else {
    logger.info('✅ SMTP connection verified successfully', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'NOT SET',
    });
  }
});

module.exports = transporter;
