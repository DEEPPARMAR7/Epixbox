const logger = require('../config/logger');

module.exports = function errorHandler(err, req, res, next) {
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
