import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle } from 'lucide-react';

function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const planName = searchParams.get('plan') || 'Premium';

  return (
    <>
      <Helmet>
        <title>Subscription Confirmed - EpixBox</title>
        <meta name="description" content="Your subscription has been confirmed" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 md:p-12 max-w-md text-center animate-in fade-in slide-in-from-bottom-4">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <CheckCircle className="w-20 h-20 text-green-500 animate-bounce" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Confirmed!</h1>

          {/* Message */}
          <p className="text-gray-600 mb-2">You've successfully subscribed to the</p>
          <p className="text-2xl font-bold text-indigo-600 mb-6">{planName} Plan</p>

          {/* Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-semibold text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Plan Type</span>
                <span className="font-semibold text-gray-900">{planName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Billing</span>
                <span className="font-semibold text-gray-900">Monthly</span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-1">✓</span>
                <span>Your new plan features are now active</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-1">✓</span>
                <span>Check your email for a confirmation receipt</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-1">✓</span>
                <span>Manage your subscription from your account settings</span>
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/subscriptions')}
              className="w-full bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              View All Plans
            </button>
          </div>

          {/* Auto-redirect message */}
          <p className="text-xs text-gray-500 mt-6">
            You'll be redirected to your dashboard in a few seconds...
          </p>
        </div>
      </div>
    </>
  );
}

export default SubscriptionSuccessPage;
