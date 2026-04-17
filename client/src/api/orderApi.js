import axiosClient from './axiosClient'
export const createOrder = (data) => axiosClient.post('/orders', data).then(r => r.data)
export const getMyOrders = () => axiosClient.get('/orders/mine').then(r => r.data)
export const getMyOrder = (id) => axiosClient.get(`/orders/mine/${id}`).then(r => r.data)
export const updateOrderStatus = (id, status) => axiosClient.patch(`/orders/mine/${id}/status`, { status }).then(r => r.data)
export const updateOrderShipping = (id, payload) => axiosClient.patch(`/orders/mine/${id}/shipping`, payload).then(r => r.data)
export const getOrderTimeline = (id) => axiosClient.get(`/orders/mine/${id}/timeline`).then(r => r.data)
