const TIER_LIMITS = {
  free: {
    maxGalleries: 3,
    maxActivePlans: 1,
    maxUploadBatch: 10,
    maxUploadFileSizeMb: 25,
    maxPhotosAccount: 500,
    canCustomDomain: false,
    canAdvancedAnalytics: false,
    label: 'Free',
  },
  pro: {
    maxGalleries: 25,
    maxActivePlans: 5,
    maxUploadBatch: 30,
    maxUploadFileSizeMb: 50,
    maxPhotosAccount: 5000,
    canCustomDomain: true,
    canAdvancedAnalytics: true,
    label: 'Pro',
  },
  business: {
    maxGalleries: 9999,
    maxActivePlans: 50,
    maxUploadBatch: 50,
    maxUploadFileSizeMb: 100,
    maxPhotosAccount: 100000,
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
