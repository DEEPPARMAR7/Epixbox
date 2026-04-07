const rateLimit = require('express-rate-limit');

const defaultHandler = (req, res) => {
  res.status(429).json({ error: 'Too many requests. Please try again later.' });
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_API_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  handler: defaultHandler,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  handler: defaultHandler,
});

const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_UPLOAD_MAX || 60),
  standardHeaders: true,
  legacyHeaders: false,
  handler: defaultHandler,
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
};
