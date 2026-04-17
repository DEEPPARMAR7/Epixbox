import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PublicLayout from '../../components/layout/PublicLayout'

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const token = searchParams.get('token')
  const canTrack = Boolean(orderId && token)

  return (
    <PublicLayout>
      <Helmet>
        <title>Order Confirmed!</title>
      </Helmet>

      <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            ✅
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Confirmed!</h1>
          <p className="text-gray-500 mb-2">
            Thank you for your order. You'll receive an email confirmation shortly.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Your prints will be processed and shipped within 5–7 business days.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {canTrack && (
              <Link
                to={`/order-status?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`}
                className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
              >
                Track Order
              </Link>
            )}
            <Link
              to="/"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
