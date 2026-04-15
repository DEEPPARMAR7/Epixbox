const TIER_LIMITS = {
  free: {
    maxGalleries: 3,
    maxActivePlans: 1,
    canCustomDomain: false,
    canAdvancedAnalytics: false,
    label: 'Free',
  },
  pro: {
    maxGalleries: 25,
    maxActivePlans: 5,
    canCustomDomain: true,
    canAdvancedAnalytics: true,
    label: 'Pro',
  },
  business: {
    maxGalleries: 9999,
    maxActivePlans: 50,
    canCustomDomain: true,
    canAdvancedAnalytics: true,
    label: 'Business',
  },
};

function normalizeTier(plan) {
  const value = String(plan || '').toLowerCase();
  if (value === 'business' || value === 'pro' || value === 'free') return value;
  return 'free';
}

function getTierLimits(plan) {
  const tier = normalizeTier(plan);
  return { tier, ...TIER_LIMITS[tier] };
}

module.exports = {
  TIER_LIMITS,
  normalizeTier,
  getTierLimits,
};
