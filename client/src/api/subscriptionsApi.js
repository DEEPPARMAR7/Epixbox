import axiosClient from './axiosClient'

export const getMySubscriptionPlans = () => axiosClient.get('/subscriptions/plans').then((r) => r.data)
export const getSubscriptionMigrationAudit = () => axiosClient.get('/subscriptions/plans/migration-audit').then((r) => r.data)
export const migrateSubscriptionPlansToStripe = (data) => axiosClient.post('/subscriptions/plans/migrate-stripe', data).then((r) => r.data)
export const createSubscriptionPlan = (data) => axiosClient.post('/subscriptions/plans', data).then((r) => r.data)
export const updateSubscriptionPlan = (id, data) => axiosClient.patch(`/subscriptions/plans/${id}`, data).then((r) => r.data)
export const deactivateSubscriptionPlan = (id) => axiosClient.delete(`/subscriptions/plans/${id}`).then((r) => r.data)
export const getSubscriptionAnalytics = () => axiosClient.get('/subscriptions/analytics').then((r) => r.data)
export const getFeatureGates = () => axiosClient.get('/subscriptions/feature-gates').then((r) => r.data)

export const getPublicSubscriptionPlans = (username) => axiosClient.get(`/subscriptions/public/${username}/plans`).then((r) => r.data)

export const createSubscriptionCheckoutSession = (data) =>
  axiosClient.post('/subscriptions/checkout-session', data).then((r) => r.data)

export const getCustomerSubscriptions = (params) =>
  axiosClient.get('/subscriptions/customer', { params }).then((r) => r.data)

export const createCustomerSubscriptionPortal = (data) =>
  axiosClient.post('/subscriptions/customer/portal', data).then((r) => r.data)
