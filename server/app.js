const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const sanitizeInput = require('./middleware/sanitize.middleware');
const requestLogger = require('./middleware/requestLogger.middleware');
const logger = require('./config/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const { Sentry, sentryEnabled } = require('./config/sentry');
const apiRouter = require('./routes/index');

const app = express();

function parseOrigins(value) {
  return String(value || '')
    .split(/[\s,]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

const configuredOrigins = Array.from(
  new Set([
    ...parseOrigins(process.env.CLIENT_URL),
    ...parseOrigins(process.env.FRONTEND_URL),
    ...parseOrigins(process.env.CORS_ORIGINS),
  ])
);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

// CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow configured production origins and localhost/LAN origins during development.
    const allowedOrigins = [
      ...(configuredOrigins.length ? configuredOrigins : ['http://localhost:5173']),
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
      /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/,
    ];
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Raw body for Stripe webhook
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));
app.use('/api/v1/orders/webhook', express.raw({ type: 'application/json' }));

// JSON body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (sentryEnabled) {
  app.use((req, res, next) => {
    Sentry.setContext('request', {
      method: req.method,
      path: req.originalUrl,
    });
    next();
  });
}

// Input sanitization (XSS/basic payload hardening)
app.use(sanitizeInput);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
  app.use(requestLogger);
}

// Rate limiting
app.use('/api', apiLimiter);
app.use('/api/v1', apiLimiter);

// Initialize DB models (sync)
require('./models/index');

// Routes
app.use('/api/v1', apiRouter);
app.use('/api', (req, res, next) => {
  res.setHeader('X-API-Deprecation', 'Use /api/v1 endpoints');
  next();
}, apiRouter);

// API docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

process.on('unhandledRejection', (reason) => {
  logger.error({ type: 'unhandledRejection', reason: String(reason) });
});

process.on('uncaughtException', (err) => {
  logger.error({ type: 'uncaughtException', message: err.message, stack: err.stack });
});

// Global error handler
app.use(require('./middleware/errorHandler.middleware'));

module.exports = app;
