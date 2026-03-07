import axiosClient from './axiosClient'
export const createOrder = (data) => axiosClient.post('/orders', data).then(r => r.data)
export const getMyOrders = () => axiosClient.get('/orders/mine').then(r => r.data)
export const getMyOrder = (id) => axiosClient.get(`/orders/mine/${id}`).then(r => r.data)
export const updateOrderStatus = (id, status) => axiosClient.patch(`/orders/mine/${id}/status`, { status }).then(r => r.data)
