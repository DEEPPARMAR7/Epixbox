import React from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const apiUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

export default function ExternalRedirectButton({ items = [], buyerEmail, buyerName }) {
  const handleClick = async () => {
    try {
      const resp = await fetch(apiUrl('/v1/checkout/external-redirect'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, buyerEmail, buyerName }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Failed to create external redirect')
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        throw new Error('Redirect URL missing')
      }
    } catch (err) {
      console.error('External redirect error:', err)
      alert('Unable to start external checkout: ' + (err.message || err))
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white/95 shadow-md"
    >
      Continue to external checkout
    </button>
  )
}
