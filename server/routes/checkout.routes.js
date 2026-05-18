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

    // Apple Pay and Google Pay currently require additional server-side integration.
    // Only support fully implemented payment gateways here to avoid broken checkout experiences.
    // If you want to enable these later, implement server-side token processing for Apple Pay / Google Pay.

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
    if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && !process.env.PAYPAL_CLIENT_ID.includes('YOUR_PAYPAL')) supportedMethods.push('paypal');

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

// Dev-only: create a simple PaymentIntent for testing without products
router.post('/test-intent', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const amount = parseInt(req.body?.amount_cents || 100, 10);
    const intent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error('Error creating test intent:', err?.message || err);
    res.status(500).json({ error: err?.message || 'Failed to create test intent' });
  }
});

// Create a hosted Checkout Session from multiple cart items and create an Order record
router.post('/create-session-from-items', async (req, res) => {
  try {
    const { items, buyer_email, buyer_name, shipping_address } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'items are required' });

    // validate and calculate totals similar to orders route
    let subtotal_cents = 0;
    const orderItems = [];
    let resolvedPhotographerId = null;

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, {
        include: [],
      });
      if (!product) return res.status(400).json({ error: `Product ${item.product_id} not found` });

      const photoId = item.photo_id || null;
      const qty = Math.max(1, Math.min(parseInt(item.quantity || 1, 10), 20));

      subtotal_cents += product.price_cents * qty;
      orderItems.push({ product, photo_id: photoId, quantity: qty });
    }

    const total_cents = subtotal_cents;
    const persistedBuyerEmail = String(buyer_email || `pending+${Date.now()}@epixbox.local`);

    // Create order record (pending) before redirecting to Checkout
    const { Order, OrderItem } = require('../models');
    const order = await Order.create({
      buyer_email: persistedBuyerEmail,
      buyer_name: String(buyer_name || null),
      photographer_id: resolvedPhotographerId,
      status: 'pending',
      subtotal_cents,
      tax_cents: 0,
      total_cents,
      shipping_address: shipping_address || null,
      notes: JSON.stringify({ timeline: [], refunds: [], public_tracking_token: null }),
    });

    for (const oi of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        photo_id: oi.photo_id,
        product_id: oi.product.id,
        quantity: oi.quantity,
        unit_price_cents: oi.product.price_cents,
        product_snapshot: { name: oi.product.name, category: oi.product.category, price_cents: oi.product.price_cents },
      });
    }

    // Build line_items for Stripe Checkout
    const line_items = orderItems.map((oi) => ({
      price: oi.product.stripe_price_id,
      quantity: oi.quantity,
    }));

    const sessionParams = {
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
      metadata: { orderId: String(order.id) },
    };

    if (buyer_email) sessionParams.customer_email = buyer_email;

    const session = await stripe.checkout.sessions.create(sessionParams);

    // store session id on order for later reconciliation
    await order.update({ checkout_session_id: session.id });

    res.json({ url: session.url, sessionId: session.id, orderId: order.id });
  } catch (err) {
    console.error('Error creating hosted checkout session from items:', err?.message || err);
    res.status(500).json({ error: err?.message || 'Failed to create checkout session' });
  }
});
