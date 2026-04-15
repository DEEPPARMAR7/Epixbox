import { Link, useParams } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

export default function SubscriptionSuccessPage() {
  const { username } = useParams()

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-emerald-300/30 bg-slate-950 p-8 text-center shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Success</p>
          <h1 className="mt-2 text-3xl font-black text-white">Subscription Activated</h1>
          <p className="mt-3 text-sm text-slate-300">Your checkout was completed successfully. You can now manage your subscription, billing details, and trial status from the management page.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              to={`/subscribe/${username}/manage`}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Manage Subscription
            </Link>
            <Link
              to={`/subscribe/${username}`}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
            >
              Back to Plans
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
