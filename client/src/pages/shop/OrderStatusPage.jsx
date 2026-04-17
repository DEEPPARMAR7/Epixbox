import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PublicLayout from '../../components/layout/PublicLayout'
import Spinner from '../../components/common/Spinner'
import { getPublicOrderStatus } from '../../api/orderApi'
import { formatCurrency } from '../../utils/formatters'

export default function OrderStatusPage() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)

  const orderId = searchParams.get('orderId') || ''
  const token = searchParams.get('token') || ''

  useEffect(() => {
    if (!orderId || !token) {
      setError('Missing tracking details. Please use the tracking link from your order confirmation page.')
      setLoading(false)
      return
    }

    getPublicOrderStatus(orderId, token)
      .then((data) => setOrder(data))
      .catch((err) => setError(err?.response?.data?.error || 'Unable to load order status right now.'))
      .finally(() => setLoading(false))
  }, [orderId, token])

  const timeline = useMemo(() => order?.timeline || [], [order])

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      </PublicLayout>
    )
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
          <p className="mt-4 text-gray-500">{error}</p>
          <Link to="/" className="inline-block mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700">
            Back to Home
          </Link>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <Helmet>
        <title>Track Order</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Order Tracking</p>
          <h1 className="mt-2 text-3xl font-black text-gray-900">Order #{order?.id?.slice(0, 8)}</h1>
          <p className="mt-2 text-sm text-gray-500">Status: <span className="font-semibold text-gray-800 uppercase">{order?.status}</span></p>
          <p className="text-sm text-gray-500">Buyer: {order?.buyer_name || order?.buyer_email_masked}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-900">Shipping</p>
          <p className="mt-2 text-sm text-gray-600">Carrier: {order?.shipping?.shipping_carrier || 'Not assigned yet'}</p>
          <p className="text-sm text-gray-600">Tracking Number: {order?.shipping?.tracking_number || 'Not available yet'}</p>
          <p className="text-sm text-gray-600">Estimated Delivery: {order?.shipping?.estimated_delivery ? new Date(order.shipping.estimated_delivery).toLocaleString() : 'Not available yet'}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-900">Order Items</p>
          <div className="mt-3 divide-y divide-gray-100">
            {(order?.items || []).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-gray-800">{item?.product_snapshot?.name || 'Product'}</p>
                  <p className="text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency((item.unit_price_cents || 0) * (item.quantity || 1))}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-gray-100 pt-3 flex items-center justify-between text-sm">
            <span className="text-gray-600">Order Total</span>
            <span className="font-semibold text-gray-900">{formatCurrency(order?.total_cents || 0)}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">Timeline</p>
          {timeline.length === 0 ? (
            <p className="text-sm text-gray-500">No timeline events yet.</p>
          ) : (
            <div className="space-y-3">
              {timeline.map((event) => (
                <div key={event.id} className="border-l-2 border-indigo-300 pl-3">
                  <p className="text-sm font-semibold text-gray-900">{event.title || event.type}</p>
                  {event.description && <p className="text-sm text-gray-600">{event.description}</p>}
                  <p className="text-xs text-gray-500 mt-1">{new Date(event.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
