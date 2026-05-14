import { useState, useEffect } from 'react'
import Spinner from './common/Spinner'
import toast from 'react-hot-toast'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const apiUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

export default function GooglePayButton({ amount, items, onSuccess, onError }) {
  const [supported, setSupported] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentsClient, setPaymentsClient] = useState(null)

  useEffect(() => {
    // Load Google Pay API
    const script = document.createElement('script')
    script.src = 'https://pay.google.com/gstatic/s/a/payment_0614675b6e7912fa.js'
    script.async = true
    script.onload = initializeGooglePay
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const initializeGooglePay = async () => {
    if (!window.google?.payments) return

    try {
      const client = new window.google.payments.api.PaymentsClient({
        environment: import.meta.env.PROD ? 'PRODUCTION' : 'TEST',
      })

      const canPay = await client.isReadyToPay({
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX'],
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            },
          },
        ],
      })

      if (canPay.result) {
        setSupported(true)
        setPaymentsClient(client)
      }
    } catch (error) {
      console.error('Google Pay initialization error:', error)
    }
  }

  const handleGooglePayClick = async () => {
    if (!paymentsClient) return

    try {
      setLoading(true)

      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX'],
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'stripe',
                'stripe:version': '2024-01-01',
                'stripe:publishableKey': import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
              },
            },
          },
        ],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: (amount / 100).toFixed(2),
          currencyCode: 'USD',
        },
        merchantInfo: {
          merchantId: import.meta.env.VITE_GOOGLE_PAY_MERCHANT_ID,
          merchantName: 'EpixBox',
        },
      }

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest)

      // Send token to server
      const response = await fetch(apiUrl('/google-pay/process-payment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: paymentData.paymentMethodData.tokenizationData.token,
          items: items,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        onSuccess?.(result)
        toast.success('Payment successful!')
      } else {
        toast.error('Payment failed')
        onError?.(new Error('Payment processing failed'))
      }
    } catch (error) {
      console.error('Google Pay error:', error)
      if (error.statusCode !== 'CANCELED') {
        toast.error('Google Pay error occurred')
        onError?.(error)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!supported) {
    return null
  }

  return (
    <button
      onClick={handleGooglePayClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 rounded-lg bg-white border-2 border-slate-300 px-4 py-3 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {loading ? <Spinner size="sm" /> : <Google className="w-5 h-5" />}
      {loading ? 'Processing...' : 'Pay with Google Pay'}
    </button>
  )
}

// Google icon component
function Google({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
