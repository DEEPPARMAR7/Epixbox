import React from 'react'
import toast from 'react-hot-toast'
import axiosClient from '../api/axiosClient'

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

export default function RazorpayPayButton({ order, onSuccess, onError, label }) {
  const handleClick = async () => {
    if (!order) return
    try {
      const payload = {
        amount_cents: Number(order.total_cents || 0),
        buyerEmail: order.buyer_email,
        buyerName: order.buyer_name || undefined,
      }

      const resp = await axiosClient.post('/razorpay/create-order', payload)
      const data = resp.data
      if (!data) throw new Error('Failed to create order')

      await loadRazorpayScript()

      const options = {
        key: data.key_id || data.keyId || data.keyId,
        amount: data.amount || data.amount,
        currency: data.currency || 'INR',
        name: import.meta.env.VITE_APP_NAME || 'EpixBox',
        order_id: data.razorpay_order_id || data.razorpayOrderId || data.razorpay_order_id,
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
            toast.success('Payment verified')
            onSuccess?.(verifyData)
          } catch (err) {
            toast.error(err?.message || 'Verification failed')
            onError?.(err)
          }
        },
        prefill: {
          name: order.buyer_name || undefined,
          email: order.buyer_email || undefined,
        },
        modal: { escape: true },
      }

      const r = new window.Razorpay(options)
      r.open()
    } catch (err) {
      toast.error(err?.message || 'Razorpay error')
      onError?.(err)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
    >
      {label || 'Pay with Razorpay'}
    </button>
  )
}
