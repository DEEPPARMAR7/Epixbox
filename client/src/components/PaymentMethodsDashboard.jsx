import { useEffect, useState } from 'react'
import { CreditCard, DollarSign, Apple, Chrome } from 'lucide-react'
import toast from 'react-hot-toast'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const apiUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

function Icon({ name }) {
  const props = { className: 'w-10 h-10' }
  switch (name) {
    case 'credit-card': return <CreditCard {...props} />
    case 'paypal': return <DollarSign {...props} />
    case 'apple': return <Apple {...props} />
    case 'google': return <Chrome {...props} />
    default: return <CreditCard {...props} />
  }
}

function ProviderCard({ m }) {
  const brandColors = {
    stripe: 'from-sky-600 to-indigo-600',
    paypal: 'from-yellow-400 to-orange-500',
    apple: 'from-slate-700 to-black',
    google: 'from-emerald-400 to-amber-400',
  }

  const gradient = brandColors[m.id] || 'from-slate-600 to-slate-800'

  const isDisabled = !m.enabled

  const openPortal = async () => {
    try {
      const resp = await fetch(apiUrl('/settings/billing/portal'), { method: 'POST' })
      if (!resp.ok) throw new Error('Failed to open billing portal')
      const data = await resp.json()
      if (data?.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer')
      } else {
        throw new Error('Portal URL missing')
      }
    } catch (err) {
      console.error('Open billing portal error:', err)
      toast.error(err?.message || 'Unable to open billing portal')
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl shadow-xl ${isDisabled ? 'opacity-70' : ''}`}>
      <div className={`p-6 bg-gradient-to-br ${gradient} text-white ${isDisabled ? 'brightness-90' : ''}`}
        style={{ minHeight: 160 }}>
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/10 p-3">
            <Icon name={m.icon || 'credit-card'} />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight">{m.name}</div>
            <div className="text-sm opacity-90 mt-1">{m.description}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xs text-white/90">Gateway</div>
            <div className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs ${isDisabled ? 'bg-white/10 text-slate-200' : 'bg-white/10 text-white'}`}>
              <span className="font-semibold">{m.id.toUpperCase()}</span>
              <span className="text-xs">{m.enabled ? 'Live' : 'Coming soon'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.open('/checkout', '_blank')}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white/95 shadow-md"
              disabled={isDisabled}
            >Preview</button>
            <button
              type="button"
              onClick={openPortal}
              className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm text-white hover:bg-white/5 shadow-sm"
              disabled={isDisabled}
            >Manage Billing</button>
          </div>
        </div>
      </div>
      <div className="p-4 bg-black/5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700">Accepted: {m.accepted || 'Cards, Wallets'}</div>
          <div className="text-sm text-slate-700">Fees: {m.fees || 'Varies'}</div>
        </div>
        {isDisabled && (
          <p className="mt-3 text-sm text-slate-500">This gateway is not currently enabled on the server.</p>
        )}
      </div>
    </div>
  )
}

export default function PaymentMethodsDashboard() {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const resp = await fetch(apiUrl('/checkout/payment-methods'))
        if (!resp.ok) throw new Error('Failed')
        const data = await resp.json()
        if (mounted) setMethods(data || [])
      } catch (err) {
        if (mounted) setMethods([
          { id: 'stripe', name: 'Stripe', description: 'Cards and wallets', icon: 'credit-card', enabled: true, accepted: 'Visa • Mastercard • Amex', fees: 'Stripe standard' },
        ])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return <div className="animate-pulse h-40 rounded-3xl bg-slate-200" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Payment Methods</p>
          <h2 className="mt-2 text-2xl font-extrabold text-white">Gateway configuration</h2>
          <p className="mt-1 text-sm text-slate-400">Preview how payment options appear to customers and quickly open gateway settings.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {methods.map((m) => (
          <ProviderCard key={m.id} m={m} />
        ))}
      </div>
    </div>
  )
}
