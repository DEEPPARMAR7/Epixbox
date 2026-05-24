const axios = require('axios');
const crypto = require('crypto');

// Usage:
// RAZORPAY_WEBHOOK_SECRET=shhh node scripts/send_test_webhook.js --url https://your.app/api/v1/checkout/razorpay/webhook --event order.paid --order_id order_DB_ID

const argv = require('minimist')(process.argv.slice(2));

const target = argv.url || process.env.TARGET_URL || 'https://epixbox.onrender.com/api/v1/checkout/razorpay/webhook';
const secret = argv.secret || process.env.RAZORPAY_WEBHOOK_SECRET;
const event = argv.event || 'order.paid';
const orderId = argv.order_id || argv.orderId || 'order_test_123';

if (!secret) {
  console.error('Missing webhook secret. Set RAZORPAY_WEBHOOK_SECRET env or pass --secret');
  process.exit(1);
}

const payload = {
  entity: 'event',
  account_id: 'acct_test',
  event: event,
  payload: {
    order: {
      entity: {
        id: orderId,
        receipt: 'rec_test_001',
        amount: 1000,
        status: 'paid'
      }
    }
  }
};

const body = JSON.stringify(payload);
const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

(async () => {
  try {
    const res = await axios.post(target, body, {
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature
      },
      timeout: 15000
    });
    console.log('Webhook POST response status:', res.status);
    console.log('Response data:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    } else {
      console.error('Error sending webhook:', err.message);
    }
    process.exit(2);
  }
})();
