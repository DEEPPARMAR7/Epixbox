const logger = require('../config/logger');
const { recordRequest } = require('../services/rateAnalytics.service');

module.exports = function requestLogger(req, res, next) {
  const started = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - started;

    logger.info({
      type: 'request',
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
    });

    if (req.originalUrl.startsWith('/api')) {
      recordRequest({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs,
      });
    }
  });

  next();
};
