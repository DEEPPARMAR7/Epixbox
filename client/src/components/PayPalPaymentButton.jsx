import { useEffect } from 'react'
import { useState } from 'react'
import Spinner from './common/Spinner'
import toast from 'react-hot-toast'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const apiUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

export default function PayPalPaymentButton({ amount, items, onSuccess, onError, onCancel }) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load PayPal script
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}`
    script.async = true
    script.onload = initializePayPal
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const initializePayPal = () => {
    if (!window.paypal) return

    window.paypal
      .Buttons({
        createOrder: async (data, actions) => {
          try {
            setLoading(true)
            const response = await fetch(apiUrl('/paypal/create-paypal-order'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: items,
                returnUrl: `${window.location.origin}/checkout/success`,
                cancelUrl: `${window.location.origin}/checkout/cancel`,
              }),
            })

            if (!response.ok) {
              throw new Error('Failed to create PayPal order')
            }

            const { id } = await response.json()
            return id
          } catch (error) {
            console.error('PayPal create order error:', error)
            toast.error('Failed to create PayPal order')
            onError?.(error)
            throw error
          } finally {
            setLoading(false)
          }
        },

        onApprove: async (data, actions) => {
          try {
            setLoading(true)
            const response = await fetch(apiUrl('/paypal/capture-paypal-order'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paypalOrderId: data.orderID,
              }),
            })

            if (!response.ok) {
              throw new Error('Failed to capture payment')
            }

            const result = await response.json()
            onSuccess?.(result)
            toast.success('Payment successful!')
          } catch (error) {
            console.error('PayPal capture error:', error)
            toast.error('Failed to process payment')
            onError?.(error)
          } finally {
            setLoading(false)
          }
        },

        onCancel: () => {
          toast.info('Payment cancelled')
          onCancel?.()
        },

        onError: (err) => {
          console.error('PayPal error:', err)
          toast.error('Payment error occurred')
          onError?.(err)
        },
      })
      .render('#paypal-container')
  }

  return (
    <div className="space-y-4">
      <div id="paypal-container" className="w-full min-h-12 rounded-lg">
        {loading && (
          <div className="flex items-center justify-center h-12">
            <Spinner size="sm" />
          </div>
        )}
      </div>
      <p className="text-center text-xs text-slate-500">🔒 Secured by PayPal. We never store your payment details.</p>
    </div>
  )
}
