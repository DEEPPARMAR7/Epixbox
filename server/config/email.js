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
});

// Test SMTP connection on startup
transporter.verify((err, success) => {
  if (err) {
    logger.error('SMTP connection failed:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'NOT SET',
      error: err.message,
    });
  } else {
    logger.info('✓ SMTP connection verified successfully', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
    });
  }
});

module.exports = transporter;
