const express = require('express');
const router = express.Router();
const { Product, SubscriptionPlan } = require('../models');

// Create a Checkout Session for a product purchase
router.post('/create-product-session', async (req, res) => {
  res.status(400).json({ error: 'Stripe checkout is disabled. Use PayPal checkout instead.' });
});

// Create a Checkout Session for a subscription plan
router.post('/create-subscription-session', async (req, res) => {
  res.status(400).json({
    error: 'Stripe subscription checkout is disabled. Use PayPal or another supported gateway instead.',
  });
});

// Get available payment methods for checkout
router.get('/payment-methods', async (req, res) => {
  try {
    const methods = [];

    // Check PayPal availability
    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (paypalClientId && paypalClientSecret && !paypalClientId.includes('YOUR_PAYPAL')) {
      methods.push({
        id: 'paypal',
        name: 'PayPal',
        description: 'Fast and secure',
        icon: 'paypal',
        enabled: true,
      });
    }

    res.json(methods);
  } catch (error) {
    console.error('Error fetching payment methods:', error.message);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// Create checkout session with payment method selection
router.post('/create-session', async (req, res) => {
  try {
    const { paymentMethod = 'paypal' } = req.body;

    if (paymentMethod !== 'paypal') {
      return res.status(400).json({ error: `Payment method '${paymentMethod}' is not enabled. Available: paypal` });
    }

    return res.json({ paymentMethod: 'paypal', message: 'Use /paypal/create-paypal-order endpoint' });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Dev-only: create a simple PaymentIntent for testing without products
router.post('/test-intent', async (req, res) => {
  res.status(400).json({ error: 'Stripe test intent is disabled. Use PayPal checkout instead.' });
});

// Create a hosted Checkout Session from multiple cart items and create an Order record
router.post('/create-session-from-items', async (req, res) => {
  res.status(400).json({
    error: 'Stripe hosted checkout from cart items is disabled. Use PayPal checkout instead.',
  });
});

module.exports = router;
