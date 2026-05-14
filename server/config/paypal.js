const axios = require('axios');

// PayPal API client
const paypalClient = axios.create({
  baseURL: process.env.PAYPAL_MODE === 'live'
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com',
  auth: {
    username: process.env.PAYPAL_CLIENT_ID,
    password: process.env.PAYPAL_CLIENT_SECRET,
  },
});

// Get PayPal access token
async function getPayPalAccessToken() {
  try {
    const response = await paypalClient.post('/v1/oauth2/token', 'grant_type=client_credentials', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('PayPal token error:', error.message);
    throw new Error('Failed to get PayPal access token');
  }
}

module.exports = {
  paypalClient,
  getPayPalAccessToken,
};
