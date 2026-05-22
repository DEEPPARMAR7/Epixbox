const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID || null;
const keySecret = process.env.RAZORPAY_KEY_SECRET || null;

let razorpay = null;
if (keyId && keySecret) {
  razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
}

module.exports = { razorpay, keyId, keySecret };
