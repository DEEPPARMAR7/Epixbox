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
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  next();
};
