import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import * as subscriptionsApi from '../api/subscriptionsApi';
import SubscriptionPlan from '../components/SubscriptionPlan';
import { useAuth } from '../hooks/use-auth';
import { AlertCircle, Loader } from 'lucide-react';

function SubscriptionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        const [plansData, currentSub] = await Promise.all([
          subscriptionsApi.browsePlans(),
          user ? subscriptionsApi.getCurrentSubscription() : Promise.resolve(null),
        ]);

        setPlans(plansData);
        setCurrentSubscription(currentSub);
      } catch (err) {
        setError(err.message || 'Failed to load subscription plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [user]);

  // Handle plan selection
  const handleSelectPlan = async (plan) => {
    if (!user) {
      // Redirect to signup if not authenticated
      navigate('/signup', { state: { plan: plan.id } });
      return;
    }

    // If user already has this plan, don't process
    if (currentSubscription?.plan_id === plan.id) {
      return;
    }

    // Stripe-based subscription checkout is disabled on this deployment.
    setError('Subscription checkout disabled (Stripe removed). Contact support or the site admin to subscribe.');
    setIsProcessing(false);
    setSelectedPlan(null);
    return;
  };

  return (
    <>
      <Helmet>
        <title>Subscription Plans - EpixBox</title>
        <meta name="description" content="Choose the perfect plan for your photography business" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Subscription Plans</h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Choose the plan that works best for your photography business. Upgrade anytime.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Error Alert */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading plans...</p>
              </div>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No plans available at the moment</p>
            </div>
          ) : (
            <>
              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {plans.map((plan) => (
                  <SubscriptionPlan
                    key={plan.id}
                    plan={plan}
                    currentPlan={currentSubscription?.plan}
                    isLoading={isProcessing && selectedPlan === plan.id}
                    onSelectPlan={handleSelectPlan}
                    action={
                      currentSubscription?.plan_id === plan.id
                        ? 'CURRENT'
                        : currentSubscription && plan.price_per_month > currentSubscription.plan.price_per_month
                          ? 'UPGRADE'
                          : currentSubscription
                            ? 'DOWNGRADE'
                            : 'SELECT'
                    }
                  />
                ))}
              </div>

              {/* FAQ Section */}
              <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change my plan later?</h3>
                    <p className="text-gray-600">
                      Yes! You can upgrade or downgrade your plan anytime. Changes take effect on your next billing cycle.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
                    <p className="text-gray-600">
                      We offer a 30-day money-back guarantee for all plans. If you're not satisfied, we'll refund your
                      subscription.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">What if I exceed my limits?</h3>
                    <p className="text-gray-600">
                      When you're close to your limits, we'll notify you. You can then upgrade your plan or contact our
                      support team.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
                    <p className="text-gray-600">
                      Absolutely! You can cancel your subscription anytime. Your access continues until the end of your
                      billing cycle.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
                    <p className="text-gray-600">
                      Many of our plans include a free trial period. Check the plan details above to see trial availability.
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {!user && (
                <div className="mt-12 bg-indigo-50 rounded-lg p-8 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Not sure which plan is right for you?</h3>
                  <p className="text-gray-600 mb-4">
                    Sign up for free with our basic plan and upgrade anytime as your business grows.
                  </p>
                  <button
                    onClick={() => navigate('/signup')}
                    className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Get Started Free
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default SubscriptionsPage;
