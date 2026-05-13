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

module.exports = router;
