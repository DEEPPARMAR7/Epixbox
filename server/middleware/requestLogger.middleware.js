const logger = require('../config/logger');

module.exports = function requestLogger(req, res, next) {
  const started = Date.now();

  res.on('finish', () => {
    logger.info({
      type: 'request',
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - started,
      ip: req.ip,
    });
  });

  next();
};
