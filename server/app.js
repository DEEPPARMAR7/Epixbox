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
// Trust proxy headers (fixes express-rate-limit 500 error on Render/Vercel)
app.set('trust proxy', 1);

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
    'https://epixbox.vercel.app',
  ])
);

function isAllowedOrigin(origin) {
  const allowedOrigins = [
    ...(configuredOrigins.length ? configuredOrigins : ['http://localhost:5173']),
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/,
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
    /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/,
  ];

  return allowedOrigins.some((allowed) => (
    typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
  ));
}

// Security headers
// Keep COOP off for regular pages so third-party payment popups
// (PayPal/Stripe) can communicate back via postMessage.
// Apply a relaxed COOP only to API routes if needed.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Apply COOP for API endpoints only (keeps client pages freer for popups)
app.use('/api', (req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Allow configured production origins and localhost/LAN origins during development.
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

// Raw body for Stripe webhook
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));
app.use('/api/v1/orders/webhook', express.raw({ type: 'application/json' }));
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use('/api/v1/subscriptions/webhook', express.raw({ type: 'application/json' }));

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

// Serve static client files (if built)
const clientPath = require('path').join(__dirname, '../client/dist');
try {
  const fs = require('fs');
  if (fs.existsSync(clientPath)) {
    app.use(express.static(clientPath, {
      maxAge: '1d',
      etag: false,
    }));
    // SPA fallback - serve index.html for all non-API routes
    app.get('/*', (req, res) => {
      res.sendFile(require('path').join(clientPath, 'index.html'));
    });
  }
} catch (err) {
  // Client not built - that's OK in development
  console.log('ℹ Client files not found - API-only mode');
}

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
