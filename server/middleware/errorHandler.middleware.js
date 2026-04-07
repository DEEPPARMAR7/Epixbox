const logger = require('../config/logger');
const { Sentry, sentryEnabled } = require('../config/sentry');

module.exports = function errorHandler(err, req, res, next) {
  if (sentryEnabled) {
    Sentry.captureException(err, {
      tags: {
        route: req.originalUrl,
        method: req.method,
      },
      user: req.user?.id ? { id: req.user.id } : undefined,
    });
  }

  logger.error({
    type: 'requestError',
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    userId: req.user?.id || null,
  });
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
};
