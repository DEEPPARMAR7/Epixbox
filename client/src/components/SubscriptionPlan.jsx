import React from 'react';
import { Check } from 'lucide-react';

/**
 * Reusable subscription plan card component
 */
function SubscriptionPlan({
  plan,
  currentPlan,
  isLoading = false,
  onSelectPlan,
  action = 'SELECT', // SELECT, UPGRADE, DOWNGRADE, CURRENT
}) {
  const isCurrentPlan = currentPlan?.id === plan.id;
  const canUpgrade = currentPlan && !isCurrentPlan;

  // Determine button styling
  const getButtonStyles = () => {
    if (isCurrentPlan) {
      return 'bg-gray-200 text-gray-700 cursor-not-allowed';
    }
    if (action === 'UPGRADE' || action === 'DOWNGRADE') {
      return 'bg-blue-600 text-white hover:bg-blue-700';
    }
    return 'bg-indigo-600 text-white hover:bg-indigo-700';
  };

  const getButtonText = () => {
    if (isCurrentPlan) return 'Current Plan';
    return action || 'Select Plan';
  };

  return (
    <div
      className={`relative rounded-lg border-2 transition-all ${
        isCurrentPlan
          ? 'border-indigo-600 bg-indigo-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-indigo-400 hover:shadow-md'
      }`}
    >
      {/* Popular badge */}
      {plan.is_featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}

      {/* Current badge */}
      {isCurrentPlan && (
        <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold">
          Your Plan
        </div>
      )}

      <div className="p-6 md:p-8">
        {/* Plan Name */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-4 h-10">{plan.description}</p>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-gray-900">${plan.price_per_month}</span>
            <span className="text-gray-600 ml-2">/month</span>
          </div>
          {plan.price_per_year && (
            <p className="text-sm text-gray-500 mt-1">
              or ${plan.price_per_year}/year (save {
                Math.round((1 - plan.price_per_year / (plan.price_per_month * 12)) * 100)
              }%)
            </p>
          )}
          {plan.trial_days > 0 && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              {plan.trial_days}-day free trial
            </p>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onSelectPlan(plan)}
          disabled={isCurrentPlan || isLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors mb-6 ${getButtonStyles()} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? 'Loading...' : getButtonText()}
        </button>

        {/* Features List */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-900 mb-4">What's included:</p>
          {plan.features && plan.features.length > 0 ? (
            plan.features.map((feature, idx) => (
              <div key={idx} className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">{feature}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No features listed</p>
          )}
        </div>

        {/* Limits */}
        {plan.limits && Object.keys(plan.limits).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-3">Limits:</p>
            <div className="space-y-2 text-sm text-gray-600">
              {Object.entries(plan.limits).map(([key, value]) => (
                <p key={key}>
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>:
                  <span className="font-medium ml-1">{value === null ? 'Unlimited' : value}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionPlan;
