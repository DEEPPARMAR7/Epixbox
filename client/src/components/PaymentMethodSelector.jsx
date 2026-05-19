import { useState, useEffect } from 'react'
import { CreditCard, DollarSign, Apple, Chrome } from 'lucide-react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const apiUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

export default function PaymentMethodSelector({ onSelect, selectedMethod = 'paypal', onMethods }) {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch(apiUrl('/checkout/payment-methods'))
      const data = await res.json()
      setMethods(data)
      onMethods?.(data)
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
      // Fallback to PayPal only
      const fallbackMethods = [
        {
          id: 'paypal',
          name: 'PayPal',
          description: 'Fast and secure',
          icon: 'paypal',
          enabled: true,
        },
      ]
      setMethods(fallbackMethods)
      onMethods?.(fallbackMethods)
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (icon) => {
    switch (icon) {
      case 'credit-card':
        return <CreditCard className="w-6 h-6" />
      case 'paypal':
        return <DollarSign className="w-6 h-6" />
      case 'apple':
        return <Apple className="w-6 h-6" />
      case 'google':
        return <Chrome className="w-6 h-6" />
      default:
        return <CreditCard className="w-6 h-6" />
    }
  }

  if (loading) {
    return <div className="animate-pulse h-24 bg-slate-200 rounded-lg" />
  }

  if (methods.length === 0) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        No payment methods available
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 mb-3">
        Select Payment Method
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            disabled={!method.enabled}
            className={`flex items-start gap-3 rounded-lg border-2 p-4 transition ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : method.enabled
                  ? 'border-slate-200 bg-white hover:border-slate-300'
                  : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className={`mt-1 ${selectedMethod === method.id ? 'text-blue-600' : 'text-slate-400'}`}>
              {getIconComponent(method.icon)}
            </div>
            <div className="text-left">
              <div className="font-medium text-slate-900">{method.name}</div>
              <div className="text-sm text-slate-500">{method.description}</div>
            </div>
            {selectedMethod === method.id && (
              <div className="ml-auto mt-1 text-blue-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
