# Enabling Live Stripe Payments

This document lists exact steps and commands to move from test/demo Stripe to live payments.

1) Get live keys
- Go to https://dashboard.stripe.com -> Developers -> API keys.
- Copy the **Publishable key** (pk_live_...) and **Secret key** (sk_live_...).

2) Set production environment variables
- In your hosting dashboard (Render, Vercel, etc.) set the following envs for your server service:

- `STRIPE_SECRET_KEY=sk_live_...`
- `STRIPE_WEBHOOK_SECRET=` (leave blank until you create the webhook below)
- `API_BASE_URL=https://your-api.example/api/v1`

- For the client build set:

- `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`

Note: The `VITE_` prefixed publishable key must be present at build time for the client bundle.

3) Deploy backend and expose webhook endpoint
- Deploy your server so the webhook endpoint is reachable at:

- `https://your-api.example/api/v1/orders/webhook`

4) Create webhook in Stripe dashboard
- In Stripe: Developers -> Webhooks -> Add endpoint
- Endpoint URL: `https://your-api.example/api/v1/orders/webhook`
- Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`, `invoice.payment_succeeded` (optional)
- After creating the endpoint, copy the **Signing secret** (whsec_...) and set it as `STRIPE_WEBHOOK_SECRET` in your server environment.

5) (Optional) Seed default products/prices
- If you want your server to create products/prices in Stripe, run the seed script from the `server` folder.

Commands (run locally with valid Stripe keys set in environment):

```bash
cd server
# for Windows PowerShell
$env:STRIPE_SECRET_KEY="sk_test_or_live_..."
$env:VITE_STRIPE_PUBLISHABLE_KEY="pk_test_or_live_..."
node scripts/seed-default-plans.js
```

This script will create products/prices in Stripe (if not already present). Check its output — it may print created IDs or instructions to add them to the database.

6) Test webhooks locally with Stripe CLI (recommended)

```bash
# Install/Sign in (https://stripe.com/docs/stripe-cli)
stripe login
# Forward events to your local server
stripe listen --forward-to http://localhost:4000/api/v1/orders/webhook
# Copy the printed webhook signing secret and set STRIPE_WEBHOOK_SECRET in your local .env
# Trigger a successful payment event to test webhook handling
stripe trigger payment_intent.succeeded
```

7) Verify checkout flow
- In test mode, use card `4242 4242 4242 4242` to confirm a successful transaction.
- Confirm the order status in the admin Payments view and the server logs.

8) Swap to live keys
- After successful tests, replace test keys with live keys in your production environment and rebuild/redeploy the client.

Quick checklist
- [ ] Backend live `STRIPE_SECRET_KEY` set
- [ ] Client `VITE_STRIPE_PUBLISHABLE_KEY` set at build time
- [ ] `STRIPE_WEBHOOK_SECRET` set after creating webhook
- [ ] Backend deployed and webhook reachable
- [ ] Seeded products/prices (optional)
- [ ] Live test transaction verified

If you want, I can:
- create the webhook via the Stripe CLI from your machine and capture the signing secret, or
- run the seed script here if you provide a valid Stripe test or live secret (set in environment).
