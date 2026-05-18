import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PublicLayout from '../../components/layout/PublicLayout'
import { useCart } from '../../hooks/useCart'
import { formatCurrency } from '../../utils/formatters'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalCents } = useCart()

  return (
    <PublicLayout>
      <Helmet>
        <title>Your Cart</title>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 mb-6">Your cart is empty.</p>
            <Link
              to="/"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Browse Portfolios
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl text-gray-300 flex-shrink-0">
                    📷
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.photoTitle}</p>
                    <p className="text-sm text-gray-500">{item.productName}</p>
                    {item.paperType && (
                      <p className="text-xs text-gray-400">{item.paperType}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.id, Number(e.target.value), item.variant_id)
                      }
                      className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                    >
                      {[1, 2, 3, 4, 5].map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency((item.unit_price_cents || item.price_cents) * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id, item.variant_id)}
                      className="text-xs text-red-400 hover:text-red-600 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">{formatCurrency(totalCents)}</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">Shipping calculated at checkout.</p>
              <Link
                to="/checkout"
                className="block w-full text-center bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/"
                className="block text-center mt-3 text-sm text-indigo-600 hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  )
}
