import { useEffect } from 'react'
import { useState } from 'react'
import Spinner from './common/Spinner'
import toast from 'react-hot-toast'

const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const apiUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

export default function PayPalPaymentButton({ amount, items, buyerEmail, buyerName, onSuccess, onError, onCancel }) {
  const [loading, setLoading] = useState(false)
  let createdOrderId = null

  useEffect(() => {
    if (!paypalClientId) return

    let mounted = true
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}`
    script.async = true
    script.onload = () => {
      if (mounted) initializePayPal()
    }
    document.body.appendChild(script)

    return () => {
      mounted = false
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [paypalClientId])

  useEffect(() => {
    if (!window.paypal) return
    const container = document.getElementById('paypal-container')
    if (container) container.innerHTML = ''
    initializePayPal()
  }, [items, buyerEmail, buyerName, onSuccess, onError, onCancel])

  const initializePayPal = () => {
    if (!window.paypal) return

    window.paypal
      .Buttons({
        createOrder: async () => {
          try {
            setLoading(true)
            const response = await fetch(apiUrl('/paypal/create-paypal-order'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items,
                buyerEmail,
                buyerName,
                returnUrl: `${window.location.origin}/checkout/success`,
                cancelUrl: `${window.location.origin}/checkout/cancel`,
              }),
            })

            if (!response.ok) {
              throw new Error('Failed to create PayPal order')
            }

            const result = await response.json()
            createdOrderId = result.orderId
            return result.id
          } catch (error) {
            console.error('PayPal create order error:', error)
            toast.error('Failed to create PayPal order')
            onError?.(error)
            throw error
          } finally {
            setLoading(false)
          }
        },

        onApprove: async (data) => {
          try {
            setLoading(true)
            const response = await fetch(apiUrl('/paypal/capture-paypal-order'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paypalOrderId: data.orderID,
                orderId: createdOrderId,
                buyerEmail,
                buyerName,
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

  if (!paypalClientId) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        PayPal is not configured. Set <code className="font-mono">VITE_PAYPAL_CLIENT_ID</code> in your environment.
      </div>
    )
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
