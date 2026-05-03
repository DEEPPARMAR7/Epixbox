import { useEffect, useState, useCallback } from 'react';
import * as subscriptionsApi from '../api/subscriptionsApi';

/**
 * Custom hook for subscription management
 * Provides current subscription, feature access, and utility methods
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current subscription and usage
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        const [subData, usageData] = await Promise.all([
          subscriptionsApi.getCurrentSubscription(),
          subscriptionsApi.getSubscriptionUsage(),
        ]);

        setSubscription(subData);
        setUsage(usageData);
      } catch (err) {
        // Gracefully handle no subscription (free user)
        if (err.response?.status === 404) {
          setSubscription(null);
          setUsage(null);
        } else {
          setError(err.message || 'Failed to fetch subscription');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  /**
   * Check if user has a specific feature
   * @param {string} featureName - Feature key to check
   * @returns {boolean} Whether feature is available
   */
  const hasFeature = useCallback((featureName) => {
    if (!subscription?.plan?.features) return false;
    return subscription.plan.features.includes(featureName);
  }, [subscription]);

  /**
   * Check if subscription is active
   * @returns {boolean}
   */
  const isActive = useCallback(() => {
    if (!subscription) return false;
    return subscription.status === 'active';
  }, [subscription]);

  /**
   * Get plan name or 'Free' if no subscription
   * @returns {string}
   */
  const getPlanName = useCallback(() => {
    return subscription?.plan?.name || 'Free';
  }, [subscription]);

  /**
   * Get subscription price per month
   * @returns {number}
   */
  const getMonthlyPrice = useCallback(() => {
    return subscription?.plan?.price_per_month || 0;
  }, [subscription]);

  /**
   * Check if user is within usage limits
   * @param {string} featureName - Feature to check (photos_per_month, galleries, etc.)
   * @returns {boolean}
   */
  const isWithinLimits = useCallback((featureName) => {
    if (!usage || !subscription?.plan?.limits) return true;

    const limit = subscription.plan.limits[featureName];
    const used = usage[featureName];

    if (!limit) return true; // Unlimited
    return used < limit;
  }, [subscription, usage]);

  /**
   * Get usage percentage for a feature
   * @param {string} featureName - Feature to check
   * @returns {number} Percentage 0-100
   */
  const getUsagePercentage = useCallback((featureName) => {
    if (!usage || !subscription?.plan?.limits) return 0;

    const limit = subscription.plan.limits[featureName];
    const used = usage[featureName] || 0;

    if (!limit) return 0; // Unlimited
    return Math.round((used / limit) * 100);
  }, [subscription, usage]);

  /**
   * Access Stripe billing portal
   */
  const openBillingPortal = useCallback(async () => {
    try {
      const { url } = await subscriptionsApi.getBillingPortalUrl();
      window.location.href = url;
    } catch (err) {
      setError(err.message || 'Failed to open billing portal');
    }
  }, []);

  /**
   * Cancel subscription
   */
  const cancel = useCallback(async (reason = 'User requested') => {
    try {
      await subscriptionsApi.cancelSubscription(reason);
      setSubscription(null);
      setUsage(null);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to cancel subscription');
      return false;
    }
  }, []);

  return {
    subscription,
    usage,
    loading,
    error,
    hasFeature,
    isActive,
    getPlanName,
    getMonthlyPrice,
    isWithinLimits,
    getUsagePercentage,
    openBillingPortal,
    cancel,
  };
}

export default useSubscription;
