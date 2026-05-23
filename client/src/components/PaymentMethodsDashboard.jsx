import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowUpRight, BadgeCheck, Chrome, CreditCard, DollarSign, Sparkles } from 'lucide-react';
import api from '../api/axiosClient';

const PROVIDER_META = {
  razorpay: {
    accent: 'from-cyan-500/20 via-sky-500/10 to-transparent',
    chip: 'text-cyan-200 border-cyan-400/30 bg-cyan-400/10',
    icon: <CreditCard className="h-5 w-5" />,
    label: 'Best for INR checkout',
    note: 'Native UPI, cards, and wallet support.',
  },
  paypal: {
    accent: 'from-sky-500/20 via-blue-500/10 to-transparent',
    chip: 'text-sky-200 border-sky-400/30 bg-sky-400/10',
    icon: <DollarSign className="h-5 w-5" />,
    label: 'Best for international buyers',
    note: 'Trusted wallet flow for cross-border sales.',
  },
  default: {
    accent: 'from-white/10 via-white/5 to-transparent',
    chip: 'text-slate-200 border-white/15 bg-white/5',
    icon: <Sparkles className="h-5 w-5" />,
    label: 'Available gateway',
    note: 'Configured in the active environment.',
  },
};

const getProviderMeta = (method) => PROVIDER_META[method.id] || PROVIDER_META.default;

function ProviderCard({ method, onOpen = () => {} }) {
  const meta = getProviderMeta(method);

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] shadow-[0_30px_80px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_35px_90px_rgba(0,0,0,0.36)]">
      <div className={`absolute inset-0 bg-gradient-to-br ${meta.accent}`} />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-lg shadow-black/20">
              {meta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-white">{method.name}</h3>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.2em] ${meta.chip}`}>
                  Live
                </span>
              </div>
              <p className="mt-1 max-w-[28ch] text-sm leading-6 text-slate-300">{method.description}</p>
            </div>
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
            {method.id === 'razorpay' ? 'Recommended' : 'Connected'}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Why it fits</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{meta.label}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Gateway note</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{meta.note}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              <BadgeCheck className="h-3.5 w-3.5" />
              Active
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              <Sparkles className="h-3.5 w-3.5" />
              Manage keys & webhooks
            </span>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Provider ID</p>
            <p className="mt-1 text-sm font-medium text-slate-200">{method.id}</p>
          </div>
          <button
            type="button"
            onClick={() => onOpen(method)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Open Checkout
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentMethodsDashboard() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load script: ' + src));
    document.body.appendChild(script);
  });

  // Open the actual checkout flow so the action remains functional.
  const handleConfigure = () => {
    navigate('/checkout');
  };

  const handleOpen = (method) => {
    // Keep the action functional by opening the customer checkout page.
    return handleConfigure(method);
  };

  useEffect(() => {
    let mounted = true;

    const fetchMethods = async () => {
      try {
        const response = await api.get('/checkout/payment-methods');
        if (mounted) {
          setMethods(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
        if (mounted) setMethods([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMethods();

    return () => {
      mounted = false;
    };
  }, []);

  const liveCount = methods.filter((method) => method.enabled).length;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#060914] shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
      <div className="relative border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%),linear-gradient(180deg,#0d1426_0%,#070b14_100%)] px-6 py-7 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-cyan-200/80">Payments</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Payments
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Manage gateways and billing. Configure providers, API keys, and webhooks.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[430px] lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Live gateways</p>
              <p className="mt-2 text-2xl font-semibold text-white">{loading ? '—' : liveCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Configured</p>
              <p className="mt-2 text-2xl font-semibold text-white">{loading ? '—' : methods.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Checkout feel</p>
              <p className="mt-2 text-sm font-medium text-slate-100">Checkout experience: Clean, customizable, and brandable</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="h-[270px] animate-pulse rounded-3xl border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : methods.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {methods.map((method) => (
              <ProviderCard key={method.id} method={method} onOpen={handleOpen} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] px-6 py-12 text-center sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-white">No live gateways detected</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              The payment-method API returned no enabled providers for this workspace. Once Razorpay or PayPal credentials are available in the environment, the cards will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}