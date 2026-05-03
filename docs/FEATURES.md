# EpixBox Features & Functionality

## Feature Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| **User Management** |
| Register/Login | ✅ Complete | JWT auth with refresh tokens |
| Password Reset | ✅ Complete | Email-based reset links |
| Two-Factor Auth | ✅ Complete | TOTP + backup codes |
| Profile Settings | ✅ Complete | Email, name, bio, avatar |
| Account Deletion | ✅ Complete | Cascading deletion of user data |
| **Gallery Management** |
| Create Gallery | ✅ Complete | Customizable settings |
| Upload Photos | ✅ Complete | Batch upload, drag-drop |
| Organize Photos | ✅ Complete | Tagging, sorting, filtering |
| Gallery Settings | ✅ Complete | Privacy, theme, password protection |
| Gallery Expiry | ✅ Complete | Auto-disable access after date |
| **Client Proofing** |
| Create Proofing Session | ✅ Complete | Generate secure links |
| Client Feedback | ✅ Complete | Comments, ratings |
| Photo Selection | ✅ Complete | Client selects photos |
| Download Approved | ✅ Complete | Watermarked exports |
| **E-Commerce** |
| Products/Prints | ✅ Complete | Multiple product types |
| Shopping Cart | ✅ Complete | Cart persistence |
| Checkout Flow | ✅ Complete | Stripe integration |
| Order Management | ✅ Complete | Order tracking, status |
| Refunds | ✅ Complete | Stripe refund processing |
| **Subscriptions** |
| Subscription Plans | ✅ Complete | Public plan browsing |
| Checkout | ✅ Complete | Stripe Checkout integration |
| Plan Management | ✅ Complete | User can view/upgrade |
| Billing Portal | ✅ Complete | Stripe customer portal link |
| Usage Limits | ✅ Complete | Track usage vs limits |
| **Analytics** |
| Revenue Tracking | ✅ Complete | Orders, subscriptions |
| Gallery Stats | ✅ Complete | Views, downloads |
| Visitor Analytics | ✅ Complete | Traffic metrics |
| **Advanced Features** |
| Watermarking | ✅ Complete | Automatic watermark on exports |
| Image Optimization | ✅ Complete | Responsive derivatives |
| Custom Domains | ⚠️ Partial | API complete, UI incomplete |
| Portfolio Themes | ⚠️ Partial | Themes defined, editor not implemented |
| Social Sharing | ⚠️ Partial | Share buttons present |

## Detailed Feature Descriptions

### Authentication & Security

#### Registration
- Email validation
- Password strength requirements (8+ characters, mixed case)
- Confirmation email (optional)
- Automatic login after registration

#### Login
- Email + password authentication
- "Remember me" functionality
- Two-factor code prompt (if enabled)
- Session persistence via refresh tokens

#### Password Reset
1. User requests reset from login page
2. Email sent with time-limited link
3. Link validates and shows password form
4. New password saved, old sessions invalidated

#### Two-Factor Authentication
- QR code setup with authenticator app
- 10 backup codes (one-time use)
- TOTP verification on login
- Option to disable anytime

### Gallery Management

#### Gallery Creation
- Name, description, slug
- Privacy level (public, private, password-protected)
- Theme selection
- Settings for comments, downloads, watermarks

#### Photo Upload
- Single or batch upload
- Drag-and-drop interface
- Progress indicators
- Automatic S3 storage with signed URLs
- EXIF data preservation

#### Photo Organization
- Drag-to-reorder
- Add tags/keywords
- Set as cover photo
- Add to multiple galleries
- Bulk actions (delete, tag, download)

#### Gallery Settings
- **Privacy**: Public, password-protected, private (invitation only)
- **Download Rights**: Full resolution, preview only, none
- **Watermark**: Enable/disable, custom text
- **Expiry**: Set date when gallery expires
- **Theme**: Choose from preset themes

### Client Proofing System

#### Proofing Session Creation
1. Photographer selects gallery
2. Generates unique token
3. Sets session expiry (7-30 days)
4. Client receives secure link
5. No authentication required for client

#### Client Experience
- View gallery without account
- Rate photos (star rating)
- Make selections
- Add comments/notes
- Download preview images

#### Photographer Dashboard
- List all proofing sessions
- See client selections
- Download approved photos
- Track approval status
- Extend or revoke access

### E-Commerce

#### Product Management
- **Product Types**: Prints, Canvas, Posters, Digital
- **Variants**: Size, material, finish options
- **Pricing**: Base price + multipliers by variant
- **Inventory**: Stock tracking per variant
- **Shipping**: Zone-based rates

#### Shopping Experience
- Browse photos
- Select product type/variant
- Add to cart
- Review cart
- Stripe checkout
- Order confirmation

#### Order Management
- Order history
- Status tracking (pending, processing, shipped)
- Download digital products
- Print fulfillment integration
- Refund requests

#### Refunds
- Customer refund requests (7-30 day window)
- Automatic Stripe processing
- Email confirmation
- Refund tracking in admin

### Subscription System

#### Available Plans
- **Basic** - $9/month
  - 10 galleries
  - Unlimited photos
  - Client proofing
  - Basic analytics
  
- **Professional** - $19/month
  - Unlimited galleries
  - Advanced analytics
  - Custom domain
  - Priority support
  
- **Enterprise** - $49/month
  - All features
  - API access
  - Custom integrations
  - Dedicated support

#### Subscription Management
- Browse available plans
- Upgrade/downgrade anytime
- Billing period selection (monthly/yearly)
- Usage tracking against limits
- Cancel anytime
- Auto-renewal (can be disabled)

#### Billing
- Stripe Checkout integration
- Secure payment processing
- Invoice storage
- Refund eligibility
- Billing portal access

### Analytics Dashboard

#### Key Metrics
- **Revenue**: MRR, total revenue, refunds
- **Orders**: Count, average value, status breakdown
- **Subscriptions**: Active count, churn rate, MRR
- **Galleries**: View count, top galleries, trend
- **Visitors**: Unique visitors, page views, geography

#### Charts & Reports
- Revenue trend (30/90 days)
- Top performing galleries
- Client distribution
- Product sales breakdown
- Subscription lifecycle

## Premium/Advanced Features

### Watermarking
- Automatic watermark on exports
- Custom text (photographer name, © notice)
- Position: corner or centered
- Opacity control
- Applied to downloads, not storage

### Image Processing
- Smart thumbnails (cropped to aspect ratio)
- WebP generation for web
- EXIF data extraction & display
- Automatic rotation correction
- Responsive image derivatives

### Custom Domains
- Photographer can set custom domain
- CNAME verification
- SSL certificate (Let's Encrypt)
- Auto-renewal
- API: `/api/custom-domain`

### Portfolio Themes
- 5 built-in themes
- Dark/light mode
- Customizable colors/fonts
- Layout options (grid, masonry, slideshow)
- CSS editor (advanced users)

### Social Integration
- Share buttons (Facebook, Twitter, Pinterest)
- Embed galleries
- Social media previews
- Instagram feed integration

## Upcoming/Future Features

### Not Yet Implemented
1. **Real-time Collaboration** - Multiple photographers, shared galleries
2. **Advanced Editing** - In-browser photo editor
3. **Client Contracts** - Digital signature workflows
4. **Invoicing** - Custom invoices for clients
5. **Integration Marketplace** - Zapier, Make, etc.
6. **Video Support** - Video uploads, playback
7. **AI Features** - Auto-tagging, smart albums
8. **Batch Processing** - Edit multiple photos at once
9. **API v2** - Webhooks, advanced queries
10. **Mobile Apps** - iOS/Android native apps

## Feature Access by Plan

### Free Plan
- 1 gallery
- 50 photos
- Basic theme
- Public sharing only
- No analytics
- No watermark
- Community support

### Basic Plan
- 10 galleries
- Unlimited photos
- All themes
- Watermarking
- Client proofing
- Basic analytics
- Email support

### Professional Plan
- Unlimited galleries
- Unlimited photos
- Advanced themes + custom CSS
- Advanced analytics
- Custom domain
- API access (read-only)
- Priority support

### Enterprise Plan
- All features
- Dedicated account manager
- Custom integrations
- Advanced API access
- Custom SLA
- 24/7 phone support

## API Feature Endpoints

```
Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

Galleries
GET    /api/galleries
POST   /api/galleries
GET    /api/galleries/:id
PUT    /api/galleries/:id
DELETE /api/galleries/:id
POST   /api/galleries/:id/photos

Photos
GET    /api/photos
POST   /api/photos (upload)
GET    /api/photos/:id
PUT    /api/photos/:id
DELETE /api/photos/:id

Subscriptions
GET    /api/subscriptions/browse
GET    /api/subscriptions/plans
GET    /api/subscriptions/current
POST   /api/subscriptions/checkout-session
GET    /api/subscriptions/analytics

Orders
POST   /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id/status
POST   /api/orders/:id/refund

Proofing
POST   /api/proofing-sessions
GET    /api/proofing/:token
POST   /api/proofing/:token/selections

Analytics
GET    /api/analytics/revenue
GET    /api/analytics/galleries
GET    /api/analytics/visitors

Two-Factor
POST   /api/auth/2fa/enable
POST   /api/auth/2fa/verify
POST   /api/auth/2fa/disable
POST   /api/auth/2fa/verify-token
```
