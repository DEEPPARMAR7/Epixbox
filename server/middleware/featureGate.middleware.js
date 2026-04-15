const { getTierLimits } = require('../utils/subscriptionTiers');

function requireFeature(check) {
  return async (req, res, next) => {
    try {
      const limits = getTierLimits(req.user?.plan);
      const result = await check({ req, limits });

      if (!result?.allowed) {
        return res.status(403).json({
          error: result?.message || 'Feature not available on current subscription tier',
          tier: limits.tier,
          limits,
        });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = {
  requireFeature,
};
