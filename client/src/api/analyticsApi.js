import axiosClient from './axiosClient'

export const getRevenueSummary = (params) => axiosClient.get('/analytics/revenue-summary', { params }).then((r) => r.data)
export const getCustomerInsights = () => axiosClient.get('/analytics/customer-insights').then((r) => r.data)
export const getProductSales = () => axiosClient.get('/analytics/product-sales').then((r) => r.data)
export const getGallerySales = () => axiosClient.get('/analytics/gallery-sales').then((r) => r.data)
