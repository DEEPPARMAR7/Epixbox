import axiosClient from './axiosClient';

/**
 * Browse public subscription plans
 * @returns {Promise<Array>} List of subscription plans
 */
export const browsePlans = () =>
  axiosClient.get('/api/subscriptions/browse').then((r) => r.data);

/**
 * Get subscription plans for a specific photographer
 * @param {string} username - Photographer's username
 * @returns {Promise<Array>} List of photographer's plans
 */
export const getBrowsePlansByUsername = (username) =>
  axiosClient.get(`/api/subscriptions/browse/${username}`).then((r) => r.data);

/**
 * Get current user's subscription
 * @returns {Promise<Object>} Current subscription details
 */
export const getCurrentSubscription = () =>
  axiosClient.get('/api/subscriptions/current').then((r) => r.data);

/**
 * Get user's subscription plans (photographer)
 * @returns {Promise<Array>} List of user's own plans
 */
export const getMyPlans = () =>
  axiosClient.get('/api/subscriptions/plans').then((r) => r.data);

/**
 * Create a new subscription plan
 * @param {Object} planData - Plan details (name, price, features, etc.)
 * @returns {Promise<Object>} Created plan
 */
export const createPlan = (planData) =>
  axiosClient.post('/api/subscriptions/plans', planData).then((r) => r.data);

/**
 * Update a subscription plan
 * @param {string} planId - Plan ID
 * @param {Object} updates - Updated plan data
 * @returns {Promise<Object>} Updated plan
 */
export const updatePlan = (planId, updates) =>
  axiosClient.patch(`/api/subscriptions/plans/${planId}`, updates).then((r) => r.data);

/**
 * Delete a subscription plan (soft delete)
 * @param {string} planId - Plan ID
 * @returns {Promise<{message: string}>}
 */
export const deletePlan = (planId) =>
  axiosClient.delete(`/api/subscriptions/plans/${planId}`).then((r) => r.data);

/**
 * Create a Stripe checkout session for subscription
 * @param {Object} checkoutData - { planId, trialDays }
 * @returns {Promise<{sessionId: string, clientSecret: string}>}
 */
export const createCheckoutSession = (checkoutData) =>
  axiosClient.post('/api/subscriptions/checkout-session', checkoutData).then((r) => r.data);

/**
 * Get analytics for user's subscription
 * @returns {Promise<Object>} Subscription analytics
 */
export const getSubscriptionAnalytics = () =>
  axiosClient.get('/api/subscriptions/analytics').then((r) => r.data);

/**
 * Get subscription usage and limits
 * @returns {Promise<Object>} Usage details (photos uploaded, galleries created, etc.)
 */
export const getSubscriptionUsage = () =>
  axiosClient.get('/api/subscriptions/usage').then((r) => r.data);

/**
 * Access Stripe billing portal
 * @returns {Promise<{url: string}>} Redirect URL to billing portal
 */
export const getBillingPortalUrl = () =>
  axiosClient.post('/api/subscriptions/customer/portal').then((r) => r.data);

/**
 * Get feature gates (which features user has access to)
 * @returns {Promise<Object>} Object with feature availability
 */
export const getFeatureGates = () =>
  axiosClient.get('/api/subscriptions/feature-gates').then((r) => r.data);

/**
 * Cancel current subscription
 * @param {string} reason - Cancellation reason
 * @returns {Promise<{message: string}>}
 */
export const cancelSubscription = (reason) =>
  axiosClient.post('/api/subscriptions/cancel', { reason }).then((r) => r.data);
