const logger = require('../config/logger');

function audit(event) {
  return (req, res, next) => {
    const started = Date.now();

    res.on('finish', () => {
      if (res.statusCode < 400 && req.method === 'GET') return;

      logger.info({
        type: 'audit',
        event,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - started,
        ip: req.ip,
        userId: req.user?.id || null,
        userRole: req.userRole || null,
      });
    });

    next();
  };
}

module.exports = {
  audit,
};
