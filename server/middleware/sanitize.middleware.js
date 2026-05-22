function sanitizeString(value) {
  return String(value)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim();
}

function sanitizeValue(value) {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (typeof value === 'object') {
    const output = {};
    for (const [k, v] of Object.entries(value)) {
      output[k] = sanitizeValue(v);
    }
    return output;
  }
  if (typeof value === 'string') return sanitizeString(value);
  return value;
}

module.exports = function sanitizeInput(req, res, next) {
  const webhookPaths = new Set([
    '/api/orders/webhook',
    '/api/v1/orders/webhook',
    '/api/subscriptions/webhook',
    '/api/v1/subscriptions/webhook',
  ]);
  const requestPath = String(req.originalUrl || req.url || '').split('?')[0];
  if (!webhookPaths.has(requestPath)) {
    req.body = sanitizeValue(req.body);
  }
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  next();
};
