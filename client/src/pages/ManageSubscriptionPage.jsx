import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, Loader, CreditCard, Calendar, Zap } from 'lucide-react';
import useSubscription from '../hooks/useSubscription';
import * as subscriptionsApi from '../api/subscriptionsApi';

function ManageSubscriptionPage() {
  const navigate = useNavigate();
  const { subscription, usage, loading, error: hookError, openBillingPortal, cancel } = useSubscription();
  const [allPlans, setAllPlans] = useState([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all plans for upgrade/downgrade comparison
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plans = await subscriptionsApi.browsePlans();
        setAllPlans(plans);
      } catch (err) {
        setError('Failed to load available plans');
      }
    };

    fetchPlans();
  }, []);

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Active Subscription</h1>
          <p className="text-gray-600 mb-6">
            You currently don't have an active subscription. Explore our plans to get started.
          </p>
          <button
            onClick={() => navigate('/subscriptions')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your subscription...</p>
        </div>
      </div>
    );
  }

  const handleUpgradePlan = async (plan) => {
    try {
      setIsProcessing(true);
      setError(null);

      const { sessionId } = await subscriptionsApi.createCheckoutSession({
        plan_id: plan.id,
      });

      const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      stripe.redirectToCheckout({ sessionId }).catch((err) => {
        setError('Failed to redirect to checkout: ' + err.message);
        setIsProcessing(false);
      });
    } catch (err) {
      setError(err.message || 'Failed to create checkout session');
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const success = await cancel('User requested cancellation');
      if (success) {
        setShowCancelConfirm(false);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPlan = subscription.plan;
  const nextBillingDate = new Date(subscription.current_period_end).toLocaleDateString();
  const daysRemaining = Math.ceil((new Date(subscription.current_period_end) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <Helmet>
        <title>Manage Subscription - EpixBox</title>
        <meta name="description" content="Manage your EpixBox subscription" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Subscription</h1>
            <p className="text-gray-600 mt-2">Review and manage your current plan</p>
          </div>

          {/* Error Alert */}
          {(error || hookError) && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error || hookError}</p>
            </div>
          )}

          {/* Current Plan Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentPlan.name}</h2>
                <p className="text-gray-600">{currentPlan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-900">
                  ${currentPlan.price_per_month}
                  <span className="text-lg text-gray-600">/month</span>
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 py-8 border-t border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-gray-900 capitalize">{subscription.status}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Next Billing</p>
                <p className="font-semibold text-gray-900">{nextBillingDate}</p>
                <p className="text-xs text-gray-500">{daysRemaining} days remaining</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Billing Cycle</p>
                <p className="font-semibold text-gray-900">
                  {currentPlan.billing_period === 'monthly' ? 'Monthly' : 'Yearly'}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentPlan.features?.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={openBillingPortal}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                Manage Billing
              </button>

              <button
                onClick={() => navigate('/subscriptions')}
                disabled={isProcessing}
                className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Change Plan
              </button>

              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={isProcessing}
                className="px-6 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                Cancel Subscription
              </button>
            </div>
          </div>

          {/* Usage Summary */}
          {usage && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Usage Overview</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(usage).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">{value}</p>
                    </div>
                    {currentPlan.limits?.[key] && (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min((value / currentPlan.limits[key]) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {currentPlan.limits[key]} limit
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Plans */}
          {allPlans.filter((p) => p.id !== currentPlan.id).length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Other Available Plans</h3>

              <div className="space-y-4">
                {allPlans
                  .filter((p) => p.id !== currentPlan.id)
                  .map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-400 transition-colors">
                      <div>
                        <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                        <p className="text-sm text-gray-600">${plan.price_per_month}/month</p>
                      </div>
                      <button
                        onClick={() => handleUpgradePlan(plan)}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        {plan.price_per_month > currentPlan.price_per_month ? 'Upgrade' : 'Downgrade'}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cancel Subscription?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your {currentPlan.name} subscription? Your access will continue
              until the end of your current billing cycle.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Cancelling...' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ManageSubscriptionPage;
