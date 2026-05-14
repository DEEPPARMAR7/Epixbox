# Multi-Gateway Payment Setup Guide

## Overview
Your EpixBox system now supports **4 professional payment gateways**:
- ✅ **Stripe** (Credit/Debit Cards) - Pre-configured
- 🆕 **PayPal** - E-commerce standard  
- 🆕 **Apple Pay** - iOS/macOS devices
- 🆕 **Google Pay** - Android/Chrome devices

## What Was Added

### Backend Components
1. **Database Migration** (`migration_phase*.js`)
   - Added `gateway_type` column to support multiple payment providers
   - Added gateway-specific IDs for flexibility

2. **PayPal Integration** (`server/config/paypal.js`)
   - OAuth token handling
   - Order creation and capture endpoints

3. **New Routes**
   - `/api/v1/paypal/create-paypal-order` - Initiate PayPal payment
   - `/api/v1/paypal/capture-paypal-order` - Complete PayPal payment
   - `/api/v1/checkout/payment-methods` - List available methods
   - `/api/v1/checkout/create-session` - Universal checkout endpoint

### Frontend Components
1. **PaymentMethodSelector.jsx** - Visual payment method picker
2. **PayPalPaymentButton.jsx** - PayPal payment integration
3. **ApplePayButton.jsx** - Apple Pay support
4. **GooglePayButton.jsx** - Google Pay support
5. **Updated CheckoutPage.jsx** - Multi-method checkout flow

## Setup Instructions

### Step 1: Run Database Migration
```bash
# From server directory
npx sequelize-cli db:migrate
```

### Step 2: Configure PayPal (Recommended)

#### Get PayPal Credentials
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com)
2. Sign up for a Business account
3. Navigate to **Apps & Credentials**
4. Create an app under Sandbox (testing)
5. Copy the **Client ID** and **Secret**

#### Update .env
```env
# PayPal Sandbox (for testing)
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=YOUR_SANDBOX_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_SANDBOX_CLIENT_SECRET
VITE_PAYPAL_CLIENT_ID=YOUR_SANDBOX_CLIENT_ID

# For production, switch to live mode:
# PAYPAL_MODE=live
# PAYPAL_CLIENT_ID=YOUR_LIVE_CLIENT_ID
# PAYPAL_CLIENT_SECRET=YOUR_LIVE_CLIENT_SECRET
```

### Step 3: Configure Apple Pay (Optional)

#### Requirements
- Apple business account
- SSL certificate for your domain
- Merchant ID from Apple

#### Update .env
```env
APPLE_PAY_ENABLED=true
APPLE_PAY_MERCHANT_ID=merchant.yourdomain.com
APPLE_PAY_DISPLAY_NAME=EpixBox
```

### Step 4: Configure Google Pay (Optional)

#### Get Google Pay Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project
3. Enable Google Pay API
4. Get your Merchant ID

#### Update .env
```env
GOOGLE_PAY_ENABLED=true
VITE_GOOGLE_PAY_MERCHANT_ID=YOUR_GOOGLE_MERCHANT_ID
```

### Step 5: Install PayPal SDK (if needed)
```bash
npm install @paypal/checkout-server-sdk
# Already included via axios for REST API
```

## Testing

### Test PayPal Payments
1. Use **Sandbox credentials** in .env
2. In checkout, select "PayPal"
3. Click "Pay with PayPal"
4. Log in with sandbox account:
   - Email: `sb-buyer@personal.example.com`
   - Password: `123456`
5. Complete test payment

### Test Stripe (Still Works)
1. Select "Credit/Debit Card" method
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any 3-digit CVC

### Test Apple Pay
- Only works on Safari with Apple device
- Requires valid SSL certificate
- Uses test mode until Apple Pay is activated

### Test Google Pay
- Works on Chrome/Edge on Android/Windows
- Uses Stripe tokenization in test mode
- Requires HTTPS

## API Endpoints Reference

### Payment Methods
```bash
GET /api/v1/checkout/payment-methods
```
Returns available payment methods based on env configuration

### Stripe Checkout (Existing)
```bash
POST /api/v1/checkout/create-product-session
POST /api/v1/checkout/create-subscription-session
```

### PayPal Checkout
```bash
POST /api/v1/paypal/create-paypal-order
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 1
    }
  ],
  "returnUrl": "https://...",
  "cancelUrl": "https://..."
}

POST /api/v1/paypal/capture-paypal-order
{
  "paypalOrderId": "paypal-order-id"
}
```

### Universal Checkout (New)
```bash
POST /api/v1/checkout/create-session
{
  "productId": "uuid",
  "quantity": 1,
  "paymentMethod": "stripe|paypal|apple_pay|google_pay",
  "buyerEmail": "user@example.com",
  "buyerName": "John Doe"
}
```

## Database Schema Changes

### SavedPaymentMethods Table - New Columns
| Column | Type | Purpose |
|--------|------|---------|
| `gateway_type` | ENUM | Payment provider (stripe, paypal, apple_pay, google_pay) |
| `gateway_customer_id` | STRING | Provider-specific customer ID |
| `gateway_payment_method_id` | STRING | Provider-specific method ID |

### Backward Compatibility
- Stripe columns remain unchanged
- Old Stripe payment methods still work (migrate to new columns optional)

## Environment Variables

```env
# Stripe (Required for basic checkout)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal (Optional)
PAYPAL_MODE=sandbox  # or 'live'
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
VITE_PAYPAL_CLIENT_ID=your_client_id

# Apple Pay (Optional)
APPLE_PAY_ENABLED=false
APPLE_PAY_MERCHANT_ID=merchant.yourdomain.com
APPLE_PAY_DISPLAY_NAME=EpixBox

# Google Pay (Optional)
GOOGLE_PAY_ENABLED=false
VITE_GOOGLE_PAY_MERCHANT_ID=your_merchant_id
```

## Troubleshooting

### "No payment methods available" in checkout
- Check that at least Stripe keys are configured
- PayPal shows only if `PAYPAL_CLIENT_ID` is set
- Apple/Google Pay show only if enabled and IDs are provided

### PayPal sandbox tests failing
- Verify sandbox credentials in .env
- Use correct sandbox test accounts
- Check `PAYPAL_MODE=sandbox` is set

### Apple Pay not appearing
- Only shows on Safari with Apple device
- Requires SSL certificate (HTTPS)
- Domain must match `APPLE_PAY_MERCHANT_ID`

### Google Pay not appearing
- Only works in Chrome/Edge
- Requires HTTPS
- Merchant ID must be registered with Google

## Migration from Stripe-Only

### For Existing Customers
1. Their saved Stripe payment methods continue working
2. New gateway columns default to NULL (backward compatible)
3. Gradual migration: add PayPal/Apple/Google as needed

### For New Customers
1. See all 4 payment options during checkout
2. Can save payment methods for future use (gateway-agnostic)

## Next Steps

1. **Get PayPal Account** (Recommended first step)
   - Adds more payment flexibility
   - Free to set up
   - High conversion rates

2. **Add Apple Pay** (for iOS users)
   - Requires Apple Developer account
   - Improves UX for iOS customers

3. **Add Google Pay** (for Android users)
   - Increases conversion on Android devices
   - Seamless with Google ecosystem

4. **Monitor Payments Dashboard**
   - Stripe Dashboard: https://dashboard.stripe.com
   - PayPal Dashboard: https://www.paypal.com/businessmanage
   - Track transactions across all gateways

## Support & Documentation

- **Stripe API**: https://stripe.com/docs/api
- **PayPal API**: https://developer.paypal.com/docs
- **Apple Pay**: https://developer.apple.com/apple-pay
- **Google Pay**: https://developers.google.com/pay

---

**Your system now offers a professional, multi-gateway payment experience** matching platforms like SmugMug, Shutterfly, and other leading photography services!
