import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import toast from 'react-hot-toast'
import { getCustomerInsights, getRevenueSummary } from '../../api/analyticsApi'
import { getSubscriptionAnalytics } from '../../api/subscriptionsApi'
import { formatCurrency } from '../../utils/formatters'
import IllustratedEmptyState from '../../components/common/IllustratedEmptyState'
import {
  DashboardChartSkeleton,
  DashboardHeaderSkeleton,
  DashboardStatsSkeleton,
} from '../../components/common/DashboardSkeletons'

const COLORS = ['#34d399', '#60a5fa', '#f59e0b', '#f472b6', '#a78bfa']

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [revenue, setRevenue] = useState(null)
  const [customerInsights, setCustomerInsights] = useState(null)
  const [subs, setSubs] = useState(null)

  useEffect(() => {
    Promise.all([getRevenueSummary(), getCustomerInsights(), getSubscriptionAnalytics()])
      .then(([r, c, s]) => {
        setRevenue(r)
        setCustomerInsights(c)
        setSubs(s)
      })
      .catch((err) => toast.error(err?.response?.data?.error || 'Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const customerChartData = useMemo(() => {
    const customers = customerInsights?.customers || []
    return customers.slice(0, 6).map((c) => ({
      name: (c.name || c.email || 'Customer').slice(0, 12),
      value: Number(c.ltv_cents || 0) / 100,
    }))
  }, [customerInsights])

  const churnData = useMemo(() => {
    const churn = Number(subs?.churn_rate_30d || 0)
    return [
      { name: 'Churn', value: churn },
      { name: 'Retained', value: Math.max(0, 100 - churn) },
    ]
  }, [subs])

  const hasData = (revenue?.order_count || 0) > 0 || (subs?.totals?.active || 0) > 0

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-5 sm:space-y-6">
          <DashboardHeaderSkeleton />
          <DashboardStatsSkeleton count={4} />
          <div className="grid gap-4 lg:grid-cols-2">
            <DashboardChartSkeleton />
            <DashboardChartSkeleton />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Analytics</p>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">Revenue and Subscriber Insights</h1>
          <p className="mt-2 text-sm text-slate-400">Track MRR, churn, and top customer value with visual charts.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Paid Revenue</p>
            <p className="mt-2 text-2xl font-black text-white">{formatCurrency(revenue?.total_revenue_cents || 0)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Orders</p>
            <p className="mt-2 text-2xl font-black text-white">{revenue?.order_count || 0}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">MRR</p>
            <p className="mt-2 text-2xl font-black text-white">{formatCurrency(subs?.mrr_cents || 0)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Churn (30d)</p>
            <p className="mt-2 text-2xl font-black text-white">{subs?.churn_rate_30d || 0}%</p>
          </div>
        </div>

        {hasData ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">Top Customer LTV</h2>
              <div className="mt-4 h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ background: '#020617', border: '1px solid #334155', color: '#fff' }}
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'LTV']}
                    />
                    <Bar dataKey="value" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">Subscriber Retention Mix</h2>
              <div className="mt-4 h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={churnData} dataKey="value" nameKey="name" outerRadius={110} label>
                      {churnData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#020617', border: '1px solid #334155', color: '#fff' }}
                      formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Share']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <IllustratedEmptyState
            variant="analytics"
            title="Analytics appear after your first activity"
            description="As soon as paid orders or subscriptions arrive, MRR, churn, and customer value charts will populate here."
            actionLabel="Open Pricing"
            actionTo="/dashboard/pricing"
          />
        )}
      </div>
    </DashboardLayout>
  )
}
