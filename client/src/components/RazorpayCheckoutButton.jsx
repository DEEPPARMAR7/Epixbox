import React from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const apiUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

async function loadRazorpayScript() {
  if (window.Razorpay) return true
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => reject(new Error('Failed to load Razorpay script'))
    document.body.appendChild(s)
  })
}

export default function RazorpayCheckoutButton({ items = [], buyerEmail, buyerName, onSuccess, onError }) {
  const handleClick = async () => {
    try {
      const resp = await fetch(apiUrl('/razorpay/create-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, buyerEmail, buyerName }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Failed to create order')

      await loadRazorpayScript()

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: import.meta.env.VITE_APP_NAME || 'EpixBox',
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyResp = await fetch(apiUrl('/razorpay/verify'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                receipt: data.orderId,
              }),
            })
            const verifyData = await verifyResp.json()
            if (!verifyResp.ok) throw new Error(verifyData?.error || 'Verification failed')
            onSuccess?.(verifyData)
          } catch (err) {
            onError?.(err)
          }
        },
        prefill: {
          name: buyerName || undefined,
          email: buyerEmail || undefined,
        },
        theme: { color: '#3366FF' },
      }

      const r = new window.Razorpay(options)
      r.open()
    } catch (err) {
      onError?.(err)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-md"
    >
      Pay with Razorpay
    </button>
  )
}
