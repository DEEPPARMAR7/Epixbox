# SmugMug-Style Subscription Browsing Implementation

## Problem Statement
Users were seeing 500 errors on `/api/subscriptions/*` endpoints because:
1. Database migration tables (`SubscriptionPlans`, `Subscriptions`) were never created in production
2. No public endpoints existed for customers to browse subscription plans without logging in
3. Client was trying to access protected endpoints that required authentication

## Solution Implemented

### 1. Fixed Database Migration Runner (server/server.js)
**Improvements:**
- Added better error logging with stderr/stdout capture
- Added DEBUG environment variable for sequelize diagnostics
- Wrapped migration execution in proper async/await flow
- Made migrations non-blocking so server starts even if migrations fail

**Impact:** Migrations will now run on production and create necessary tables on next Render deployment.

### 2. Added Public Subscription Browsing Endpoints

#### `GET /api/subscriptions/browse` (Public - All Plans)
```json
// Response
{
  "total": 4,
  "plans": [
    {
      "id": "plan-uuid",
      "photographer": {
        "id": "user-uuid",
        "username": "john_photos",
        "brand_name": "John Photography"
      },
      "name": "Basic Monthly",
      "description": "Perfect for getting started",
      "price_cents": 999,
      "billing_period": "monthly",
      "trial_days": 14,
      "features": { ... }
    }
  ]
}
```

#### `GET /api/subscriptions/browse/:username` (Public - Photographer-Specific)
```json
// Response
{
  "photographer": {
    "username": "john_photos",
    "brand_name": "John Photography"
  },
  "total": 3,
  "plans": [ ... ]
}
```

**Query Parameters:**
- `groupBy=photographer` - Returns plans grouped by photographer

**Key Features:**
- ✅ No authentication required
- ✅ Only returns active (`is_active: true`) plans
- ✅ Sorted by price (lowest first)
- ✅ Includes photographer branding info

### 3. Created Subscription Seed Script

Location: `server/scripts/seed-default-plans.js`

**Default Plans Included:**
- Basic Monthly: $9.99/month (5 prints, 14-day trial)
- Plus Monthly: $24.99/month (20 prints, rush processing, 14-day trial)
- Pro Monthly: $49.99/month (100 prints, priority support, early access, 14-day trial)
- Annual Pro: $479.91/year (same as Pro, 20% savings)

**Usage:**
```bash
cd server
node scripts/seed-default-plans.js
```

This creates a system user and populates default plans that photographers can reference or copy.

### 4. New Public Subscription Browsing Page

Location: `client/src/pages/subscriptions/SubscriptionsPage.jsx`

**Features:**
- ✅ Browse all available subscription plans
- ✅ View plans grouped by photographer
- ✅ See plan details (price, billing period, trial days, features)
- ✅ Call-to-action button to start free trial
- ✅ Responsive design for mobile/tablet/desktop
- ✅ No authentication required

**Routing:**
- Route: `/subscriptions`
- Navigation: Added "subscriptions" link in navbar after "pricing"

### 5. Updated Client API

New public endpoints in `client/src/api/subscriptionsApi.js`:

```javascript
// Browse all available subscription plans
export const browseAllSubscriptionPlans = (groupBy = null)

// Browse plans for a specific photographer
export const browsePhotographerSubscriptionPlans = (username)

// Legacy endpoint (still supported)
export const getPublicSubscriptionPlans = (username)
```

## How It Works (SmugMug-Style Flow)

1. **Visitor lands on site** → Sees "Subscriptions" link in navbar
2. **Click "Subscriptions"** → Goes to `/subscriptions` (public page)
3. **Browses available plans** → Sees all active subscription plans with photographer info
4. **Selects a plan** → Clicks "Get Started" 
5. **Redirected to signup** → Creates free account
6. **Enters checkout flow** → Uses Stripe session to purchase subscription

## Testing Instructions

### Local Development

```bash
# Start server
cd server
npm install
npm run dev

# Start client
cd client
npm run dev

# Open browser
# http://localhost:5173/subscriptions
```

### Production (Render)

1. **Migration auto-runs** on next Render deployment
   - Render will execute `npm run build` and `npm start` in server folder
   - Migration runner will create tables automatically

2. **Seed default plans** (optional):
   ```bash
   # In Render dashboard, open web service → Shell
   cd /var/task/server
   node scripts/seed-default-plans.js
   ```

3. **Test public endpoint:**
   ```bash
   curl https://epixbox.onrender.com/api/subscriptions/browse
   ```

4. **View on site:**
   - Visit https://epixbox.onrender.com/subscriptions
   - Should see browseable subscription plans

## API Comparison

| Endpoint | Auth | Purpose | Returns |
|----------|------|---------|---------|
| `GET /api/subscriptions/plans` | ✅ Required | Get photographer's own plans | User's plans |
| `GET /api/subscriptions/browse` | ❌ Public | Browse all active plans | All active plans |
| `GET /api/subscriptions/browse/:username` | ❌ Public | Browse specific photographer | That photographer's plans |
| `GET /api/subscriptions/public/:username/plans` | ❌ Public | Legacy public endpoint | That photographer's plans |

## Future Enhancements

1. **Analytics Dashboard**: Track subscription metrics
2. **Plan Customization UI**: Let photographers create custom plans
3. **Subscription Management Portal**: Customers manage their subscriptions
4. **Revenue Tracking**: Photographers see subscription revenue
5. **Automatic Plan Recommendations**: Suggest plans based on purchase history

## Troubleshooting

**Issue:** Still getting 500 errors on `/api/subscriptions/*`

**Solution:**
1. Ensure Render redeploys (it auto-runs migrations)
2. Check Render logs for migration output
3. Verify database connection is working
4. If tables still don't exist, manually run:
   ```bash
   cd /var/task/server
   npx sequelize-cli db:migrate
   ```

**Issue:** Plans don't appear on `/subscriptions` page

**Solution:**
1. Ensure at least one subscription plan exists with `is_active: true`
2. Check browser console for API errors
3. Verify `/api/subscriptions/browse` returns data:
   ```bash
   curl https://epixbox.onrender.com/api/subscriptions/browse
   ```

## Files Modified

- `server/server.js` - Improved migration runner
- `server/routes/subscriptions.routes.js` - Added public endpoints
- `server/scripts/seed-default-plans.js` - New seed script (created)
- `client/src/pages/subscriptions/SubscriptionsPage.jsx` - New browsing page (created)
- `client/src/api/subscriptionsApi.js` - New public API functions
- `client/src/App.tsx` - Added `/subscriptions` route
- `client/src/components/Navbar.tsx` - Added subscriptions nav link

## Commit Info

**Commit:** `1e19b66`
**Message:** "feat: add public subscription browsing experience with improved migration runner"

This completes the SmugMug-style public subscription browsing experience!
