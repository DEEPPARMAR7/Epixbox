const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { getPayPalAccessToken, paypalClient } = require('../config/paypal');
const { Order, OrderItem, Product, Photo, PriceList } = require('../models');

// Create PayPal order (first step - client calls this)
router.post('/create-paypal-order', async (req, res) => {
  try {
    const { items, buyerEmail, buyerName, returnUrl, cancelUrl } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    let totalCents = 0;
    const lineItems = [];
    const orderItems = [];
    let resolvedPhotographerId = null;

    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        include: [{ model: PriceList, attributes: ['id', 'user_id'] }],
      });
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      const photo = await Photo.findByPk(item.photoId, { attributes: ['id', 'user_id'] });
      if (!photo) {
        return res.status(404).json({ error: `Photo ${item.photoId} not found` });
      }

      const photographerId = product.PriceList?.user_id;
      if (!photographerId || String(photographerId) !== String(photo.user_id)) {
        return res.status(400).json({ error: 'Invalid item mapping between product and photo owner' });
      }

      if (!resolvedPhotographerId) resolvedPhotographerId = photographerId;
      if (String(resolvedPhotographerId) !== String(photographerId)) {
        return res.status(400).json({ error: 'All items in one order must belong to the same photographer' });
      }

      const quantity = Math.max(1, Math.min(parseInt(item.quantity || 1, 10), 20));
      const itemTotal = product.price_cents * quantity;
      totalCents += itemTotal;

      orderItems.push({ product, photo_id: item.photoId, quantity });
      lineItems.push({
        name: product.name,
        description: product.description || '',
        quantity: String(quantity),
        unit_amount: {
          currency_code: 'USD',
          value: (product.price_cents / 100).toFixed(2),
        },
      });
    }

    if (!resolvedPhotographerId) {
      return res.status(400).json({ error: 'Unable to resolve photographer for this order' });
    }

    const normalizedBuyerEmail = String(buyerEmail || '').trim().toLowerCase();
    const persistedBuyerEmail = normalizedBuyerEmail || `pending+${Date.now()}@epixbox.local`;
    const normalizedBuyerName = String(buyerName || '').trim() || null;

    const order = await Order.create({
      buyer_email: persistedBuyerEmail,
      buyer_name: normalizedBuyerName,
      photographer_id: resolvedPhotographerId,
      status: 'pending',
      subtotal_cents: totalCents,
      tax_cents: 0,
      total_cents: totalCents,
      notes: JSON.stringify({
        public_tracking_token: crypto.randomBytes(16).toString('hex'),
        timeline: [],
        refunds: [],
      }),
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

    await order.update({ paypal_order_id: response.data.id });

    res.json({
      id: response.data.id,
      status: response.data.status,
      orderId: order.id,
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
    const { paypalOrderId, orderId, buyerEmail, buyerName } = req.body;

    if (!paypalOrderId) {
      return res.status(400).json({ error: 'PayPal Order ID required' });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await paypalClient.post(`/v2/checkout/orders/${paypalOrderId}/capture`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.data.status !== 'COMPLETED') {
      return res.status(400).json({
        error: 'Payment not completed',
        status: response.data.status,
      });
    }

    let order = null;
    if (orderId) {
      order = await Order.findByPk(orderId);
    }
    if (!order) {
      order = await Order.findOne({ where: { paypal_order_id: paypalOrderId } });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const captureData = response.data;
    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || captureData.id;
    const payerEmail = captureData.payer?.email_address || buyerEmail || order.buyer_email;

    await order.update({
      status: 'paid',
      buyer_email: payerEmail,
      buyer_name: String(buyerName || order.buyer_name || '').trim() || order.buyer_name,
      paypal_transaction_id: captureId,
    });

    res.json({
      status: 'completed',
      transactionId: captureId,
      payer: captureData.payer,
      orderId: order.id,
    });
  } catch (error) {
    console.error('PayPal capture error:', error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.message || 'Failed to capture PayPal payment',
    });
  }
});

module.exports = router;
