const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const { Product, SubscriptionPlan } = require('../models');

// Create a Checkout Session for a product purchase
router.post('/create-product-session', async (req, res) => {
  try {
    const { productId, quantity = 1, variantId, buyerEmail, buyerName } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Use product's stripe_price_id if available
    const priceId = product.stripe_price_id || variantId;
    if (!priceId) {
      return res.status(400).json({ error: 'Product has no price configured' });
    }

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
      metadata: {
        productId: String(productId),
        quantity: String(quantity),
        buyerEmail: String(buyerEmail || ''),
        buyerName: String(buyerName || ''),
      },
    };

    // If buyer email provided, use it for customer
    if (buyerEmail) {
      sessionParams.customer_email = buyerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Create a Checkout Session for a subscription plan
router.post('/create-subscription-session', async (req, res) => {
  try {
    const { planId, customerId } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'planId is required' });
    }

    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscriptions/cancel`,
      metadata: {
        planId: String(planId),
      },
    };

    // If customer ID provided, use it (for existing customers)
    if (customerId) {
      sessionParams.customer = customerId;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating subscription session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get available payment methods for checkout
router.get('/payment-methods', async (req, res) => {
  try {
    const methods = [];

    // Check Stripe availability
    if (process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY) {
      methods.push({
        id: 'stripe',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, Amex',
        icon: 'credit-card',
        enabled: true,
      });
    }

    // Check PayPal availability
    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    if (paypalClientId && !paypalClientId.includes('YOUR_PAYPAL')) {
      methods.push({
        id: 'paypal',
        name: 'PayPal',
        description: 'Fast and secure',
        icon: 'paypal',
        enabled: true,
      });
    }

    // Check Apple Pay availability
    if (process.env.APPLE_PAY_ENABLED === 'true') {
      methods.push({
        id: 'apple',
        name: 'Apple Pay',
        description: 'Quick and secure',
        icon: 'apple',
        enabled: true,
      });
    }

    // Check Google Pay availability
    if (process.env.GOOGLE_PAY_ENABLED === 'true') {
      methods.push({
        id: 'google',
        name: 'Google Pay',
        description: 'Easy payment',
        icon: 'google',
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
    const { productId, paymentMethod = 'stripe', quantity = 1, variantId, buyerEmail, buyerName } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    // Validate payment method is supported
    const supportedMethods = [];
    if (process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY) supportedMethods.push('stripe');
    if (process.env.PAYPAL_CLIENT_ID && !process.env.PAYPAL_CLIENT_ID.includes('YOUR_PAYPAL')) supportedMethods.push('paypal');

    if (!paymentMethod || !supportedMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: `Payment method '${paymentMethod}' is not enabled. Available: ${supportedMethods.join(', ')}` });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Stripe uses hosted checkout
    if (paymentMethod === 'stripe') {
      return handleStripeCheckout(res, product, quantity, variantId, buyerEmail, buyerName);
    }

    // PayPal has its own separate order creation flow
    if (paymentMethod === 'paypal') {
      return res.json({ paymentMethod: 'paypal', productId, quantity, message: 'Use /paypal/create-paypal-order endpoint' });
    }

    return res.status(400).json({ error: 'Unknown payment method' });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Helper function for Stripe checkout
async function handleStripeCheckout(res, product, quantity, variantId, buyerEmail, buyerName) {
  const priceId = product.stripe_price_id || variantId;
  if (!priceId) {
    return res.status(400).json({ error: 'Product has no price configured for Stripe' });
  }

  const sessionParams = {
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: quantity,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&method=stripe`,
    cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
    metadata: {
      productId: String(product.id),
      quantity: String(quantity),
      buyerEmail: String(buyerEmail || ''),
      buyerName: String(buyerName || ''),
    },
  };

  if (buyerEmail) {
    sessionParams.customer_email = buyerEmail;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  res.json({ url: session.url, sessionId: session.id, method: 'stripe' });
}

module.exports = router;
