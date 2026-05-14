import { useState, useEffect } from 'react'
import Spinner from './common/Spinner'
import toast from 'react-hot-toast'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const apiUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

export default function ApplePayButton({ amount, items, onSuccess, onError }) {
  const [supported, setSupported] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if Apple Pay is supported
    if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
      setSupported(true)
    }
  }, [])

  const handleApplePayClick = async () => {
    try {
      setLoading(true)

      const request = {
        countryCode: 'US',
        currencyCode: 'USD',
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        merchantCapabilities: ['supports3DS', 'supportsEMV'],
        total: {
          label: 'EpixBox Purchase',
          amount: (amount / 100).toFixed(2),
        },
        lineItems: items.map((item) => ({
          label: item.name,
          amount: (item.price * item.quantity).toFixed(2),
        })),
      }

      const session = new window.ApplePaySession(3, request)

      session.onvalidatemerchant = async (event) => {
        try {
          // Call your server to validate the merchant
          const response = await fetch(apiUrl('/apple-pay/validate-merchant'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ validationUrl: event.validationURL }),
          })
          const merchantSession = await response.json()
          session.completeMerchantValidation(merchantSession)
        } catch (error) {
          console.error('Merchant validation error:', error)
          session.abort()
        }
      }

      session.onpaymentauthorized = async (event) => {
        try {
          // Send payment token to your server
          const response = await fetch(apiUrl('/apple-pay/process-payment'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: event.payment.token,
              items: items,
            }),
          })

          if (response.ok) {
            session.completePayment(window.ApplePaySession.STATUS_SUCCESS)
            const result = await response.json()
            onSuccess?.(result)
            toast.success('Payment successful!')
          } else {
            session.completePayment(window.ApplePaySession.STATUS_FAILURE)
            toast.error('Payment failed')
          }
        } catch (error) {
          console.error('Payment processing error:', error)
          session.completePayment(window.ApplePaySession.STATUS_FAILURE)
          onError?.(error)
        }
      }

      session.oncancel = () => {
        toast.info('Payment cancelled')
      }

      session.begin()
    } catch (error) {
      console.error('Apple Pay error:', error)
      toast.error('Apple Pay is not available')
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }

  if (!supported) {
    return null
  }

  return (
    <button
      onClick={handleApplePayClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-white font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {loading ? <Spinner size="sm" /> : <Apple className="w-5 h-5" />}
      {loading ? 'Processing...' : 'Pay with Apple Pay'}
    </button>
  )
}

// Apple icon component
function Apple({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.05 13.5c-.91 0-1.82-.55-2.25-1.64h5.25c.12.89-.81 2.64-2.99 2.64m-2.24-5c1.37 0 2.26 1.08 2.26 2.64h-4.52c0-1.56.89-2.64 2.26-2.64" />
    </svg>
  )
}
