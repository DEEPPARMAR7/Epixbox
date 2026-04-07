function requireRole(...allowedRoles) {
  const allowed = new Set(allowedRoles.map((r) => String(r).toLowerCase()));

  return (req, res, next) => {
    const role = String(req.userRole || 'client').toLowerCase();
    if (!allowed.has(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    return next();
  };
}

module.exports = {
  requireRole,
};
