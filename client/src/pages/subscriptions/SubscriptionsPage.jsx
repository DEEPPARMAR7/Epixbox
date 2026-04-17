import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PublicLayout from '../../components/layout/PublicLayout'
import Spinner from '../../components/common/Spinner'
import { browseAllSubscriptionPlans } from '../../api/subscriptionsApi'
import toast from 'react-hot-toast'
import { Check } from 'lucide-react'

export default function SubscriptionsPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [groupedByPhotographer, setGroupedByPhotographer] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [groupedByPhotographer])

  const loadPlans = async () => {
    setLoading(true)
    try {
      const data = await browseAllSubscriptionPlans(groupedByPhotographer ? 'photographer' : null)
      setPlans(Array.isArray(data) ? data : data.plans || [])
    } catch (error) {
      console.error('Error loading plans:', error)
      toast.error('Failed to load subscription plans')
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (plan, photographerId) => {
    // In a real implementation, this would start a checkout flow
    // For now, redirect to signup and store the plan info
    toast.success(`Selected plan: ${plan.name}`)
    navigate('/auth/signup', {
      state: {
        selectedPlan: plan.id,
        photographerId: photographerId,
      },
    })
  }

  return (
    <PublicLayout>
      <Helmet>
        <title>Subscription Plans - EpixBox</title>
        <meta name="description" content="Browse available subscription plans from photographers on EpixBox" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Subscription Plans
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Choose from available subscription plans offered by photographers on EpixBox. Each plan
              provides unique benefits tailored to your needs.
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={groupedByPhotographer}
                onChange={(e) => setGroupedByPhotographer(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600"
              />
              <span className="text-sm text-gray-700">Group by Photographer</span>
            </label>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" />
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-600 text-lg">No subscription plans available yet.</p>
              <p className="text-gray-500 mt-2">Check back soon as photographers add their plans!</p>
            </div>
          ) : groupedByPhotographer ? (
            // Grouped view
            <div className="space-y-12">
              {plans.map((group) => (
                <div key={group.photographer.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Photographer header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-8">
                    <h2 className="text-2xl font-bold text-white">
                      {group.photographer.brand_name || group.photographer.username}
                    </h2>
                    <p className="text-indigo-100 mt-1">@{group.photographer.username}</p>
                  </div>

                  {/* Plans grid */}
                  <div className="p-8">
                    {group.plans.length === 0 ? (
                      <p className="text-gray-500 py-8">This photographer hasn't created any plans yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {group.plans.map((plan) => (
                          <PlanCard
                            key={plan.id}
                            plan={plan}
                            onSelect={() => handleSelectPlan(plan, group.photographer.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Flat list view
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((item) => (
                <div key={item.id} className="space-y-4">
                  {/* Photographer badge */}
                  <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="font-medium text-gray-900">
                      {item.photographer.brand_name || item.photographer.username}
                    </p>
                    <p className="text-gray-500">@{item.photographer.username}</p>
                  </div>
                  <PlanCard plan={item.name ? item : item.plans?.[0]} onSelect={() => handleSelectPlan(item.name ? item : item.plans?.[0], item.photographer?.id)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}

function PlanCard({ plan, onSelect }) {
  if (!plan) return null

  const price = plan.price_cents / 100
  const billingLabel = plan.billing_period === 'yearly' ? 'year' : 'month'
  const monthlyPrice = plan.billing_period === 'yearly' ? (price / 12).toFixed(2) : price.toFixed(2)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        {plan.description && (
          <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
        )}
      </div>

      {/* Pricing */}
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900">${monthlyPrice}</span>
          <span className="text-gray-600">per {billingLabel}</span>
        </div>
        {plan.trial_days > 0 && (
          <p className="text-sm text-emerald-600 font-medium mt-3">
            ✓ {plan.trial_days}-day free trial
          </p>
        )}
      </div>

      {/* Features */}
      {plan.features && Object.keys(plan.features).length > 0 && (
        <div className="p-6 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">What's Included</h4>
          <div className="space-y-3">
            {Object.entries(plan.features).map(([key, value]) => (
              <div key={key} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  {typeof value === 'boolean'
                    ? key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)
                    : `${key.replace(/_/g, ' ')}: ${value}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="p-6">
        <button
          onClick={onSelect}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Get Started
        </button>
        <p className="text-xs text-gray-500 text-center mt-3">
          You'll create a free account to get started
        </p>
      </div>
    </div>
  )
}
