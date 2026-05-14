const express = require('express');
const router = express.Router();
const { getPayPalAccessToken, paypalClient } = require('../config/paypal');
const { Order, OrderItem, Product } = require('../models');

// Create PayPal order (first step - client calls this)
router.post('/create-paypal-order', async (req, res) => {
  try {
    const { items, returnUrl, cancelUrl } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // Calculate total
    let totalCents = 0;
    const lineItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      const itemTotal = product.price_cents * item.quantity;
      totalCents += itemTotal;

      lineItems.push({
        name: product.name,
        description: product.description || '',
        quantity: String(item.quantity),
        unit_amount: {
          currency_code: 'USD',
          value: (product.price_cents / 100).toFixed(2),
        },
      });
    }

    const accessToken = await getPayPalAccessToken();

    const paypalOrderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: (totalCents / 100).toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: (totalCents / 100).toFixed(2),
              },
            },
          },
          items: lineItems,
        },
      ],
      application_context: {
        brand_name: 'EpixBox',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: returnUrl || `${process.env.FRONTEND_URL}/checkout/success`,
        cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/checkout/cancel`,
      },
    };

    const response = await paypalClient.post('/v2/checkout/orders', paypalOrderData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.json({
      id: response.data.id,
      status: response.data.status,
    });
  } catch (error) {
    console.error('PayPal order creation error:', error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.message || 'Failed to create PayPal order',
    });
  }
});

// Capture PayPal payment
router.post('/capture-paypal-order', async (req, res) => {
  try {
    const { paypalOrderId, buyerEmail, buyerName } = req.body;

    if (!paypalOrderId) {
      return res.status(400).json({ error: 'PayPal Order ID required' });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await paypalClient.post(`/v2/checkout/orders/${paypalOrderId}/capture`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.data.status === 'COMPLETED') {
      res.json({
        status: 'completed',
        transactionId: response.data.id,
        payer: response.data.payer,
      });
    } else {
      res.status(400).json({
        error: 'Payment not completed',
        status: response.data.status,
      });
    }
  } catch (error) {
    console.error('PayPal capture error:', error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.message || 'Failed to capture PayPal payment',
    });
  }
});

module.exports = router;
