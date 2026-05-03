# EpixBox Architecture & System Design

## System Overview

EpixBox is a full-stack monorepo photography platform with clear separation between frontend (React + Vite) and backend (Express.js + PostgreSQL). This document describes the architectural decisions, data flows, and design patterns used throughout the project.

```
┌─────────────────────────────────────────────────────────────┐
│                   Browser / Client                           │
│  (React 19, Vite, React Router, Zustand, Tailwind CSS)      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS / REST API
                     │ JWT Authentication
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Express.js API Server (Node.js)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Routes / Controllers                                 │  │
│  │ - Auth, Gallery, Photo, Order, Subscription, etc.   │  │
│  └────────────┬──────────────────────────────────────────┘  │
│               │                                              │
│  ┌────────────┴───────────────────────────────────────────┐ │
│  │ Services / Business Logic                            │ │
│  │ - ImageProcessing, S3Upload, EmailService, etc.     │ │
│  └────────────┬──────────────────────────────────────────┘ │
│               │                                              │
│  ┌────────────┴───────────────────────────────────────────┐ │
│  │ Middleware & Security                                │ │
│  │ - Auth, CORS, RateLimit, Validation, ErrorHandler   │ │
│  └────────────┬──────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌────────────┐  ┌────────────┐  ┌──────────┐
│ PostgreSQL │  │ AWS S3     │  │ Redis    │
│ Database   │  │ Storage    │  │ Cache    │
└────────────┘  └────────────┘  └──────────┘
```

## Frontend Architecture

### Directory Structure
```
client/src/
├── api/              - HTTP clients for backend APIs
├── components/       - Reusable React components
├── hooks/            - Custom React hooks
├── pages/            - Route pages
├── store/            - Zustand state management
├── lib/              - Utilities and helpers
└── styles/           - Tailwind CSS config
```

### State Management Pattern
- **Zustand** for authentication state (auth.store.ts)
- **React Query** for server state (API data caching)
- **React Router** for navigation state
- **Local component state** for UI state (forms, modals, etc.)

### API Communication Flow
```
Component
   │
   ├─→ useAuth() hook [returns user, isLoading, etc.]
   │     │
   │     └─→ Zustand auth store [persistent in localStorage]
   │
   └─→ API client (e.g., galleryApi.js)
         │
         ├─→ axiosClient [configured with interceptors]
         │     │
         │     ├─→ Request interceptor [adds JWT token]
         │     │
         │     └─→ Response interceptor [handles 401 refresh]
         │
         └─→ Stripe SDK (for payments)
               │
               └─→ Backend payment webhooks
```

### Authentication Flow
1. **Login**: User submits credentials → Backend validates → Returns access + refresh tokens
2. **Storage**: Tokens stored in `localStorage` + Zustand store
3. **Requests**: Every API call includes `Authorization: Bearer <token>` header
4. **Token Refresh**: Interceptor detects 401 → requests new access token using refresh token
5. **Logout**: Tokens cleared from localStorage + Zustand state reset

## Backend Architecture

### Directory Structure
```
server/
├── config/           - Configuration (database, AWS, Stripe, etc.)
├── models/           - Sequelize ORM models
├── routes/           - Express route handlers
├── middleware/       - Custom middleware functions
├── services/         - Business logic & external integrations
├── database/         - Migrations
├── scripts/          - Utility scripts
└── utils/            - Helper functions
```

### Request Processing Pipeline
```
HTTP Request
   │
   ▼
Express App
   │
   ├─→ Body Parser [parse JSON/form data]
   │
   ├─→ CORS Middleware [validate origin]
   │
   ├─→ Rate Limiter [limit requests per IP]
   │
   ├─→ Winston Logger [log request]
   │
   ├─→ Auth Middleware [verify JWT token]
   │     │
   │     └─→ Extract user from token payload
   │
   ├─→ Validation Middleware [express-validator]
   │
   ├─→ Route Handler [execute business logic]
   │     │
   │     ├─→ Query database via Sequelize models
   │     │
   │     ├─→ Call services (upload, email, etc.)
   │     │
   │     └─→ Return response
   │
   └─→ Error Handler Middleware [format error response]

HTTP Response
```

### Database Design

#### Core Tables
- **Users** - User accounts with encrypted passwords
- **Gallery** - Photo collections owned by users
- **Photo** - Individual photos with metadata
- **Tag** - Photo tags
- **PhotoTag** - Many-to-many relationship

#### E-Commerce Tables
- **Order** - Customer orders
- **OrderItem** - Items in orders
- **Product** - Sellable products (prints, canvas, etc.)
- **ProductVariant** - Variations (size, material, etc.)
- **PriceList** - Custom pricing by gallery

#### Client Proofing
- **ProofingSession** - Photo approval sessions
- **ProofingSelection** - Photos selected by client
- **ProofingComment** - Client feedback

#### Subscriptions & Billing
- **SubscriptionPlan** - Available subscription tiers
- **Subscription** - Active subscriptions
- **SavedPaymentMethod** - Stripe payment methods
- **Refund** - Refund records

#### All IDs are UUIDs for:
- Distributed system compatibility
- Privacy (no sequential ID enumeration)
- Database federation (if needed)

### Service Layer

#### EmailService
- Sends transactional emails
- Templates: Welcome, password reset, order confirmation, etc.
- Uses Nodemailer with SMTP

#### ImageService
- Image processing with Sharp
- Creates derivatives (thumbnails, web-optimized)
- Handles EXIF data preservation
- Watermarking support

#### S3Service
- File uploads to AWS S3
- Generates signed download URLs
- Handles image CDN integration
- Automatic cleanup of old files

#### StripeService
- Payment processing
- Subscription management
- Webhook handling
- Refund processing

#### AuthService
- JWT generation and validation
- Password hashing with bcryptjs
- 2FA token generation and verification
- Session management

## Authentication & Security

### JWT Token Strategy
```
Access Token (short-lived: 15 minutes)
├── user_id
├── email
├── role (photographer or client)
└── exp: current_time + 15m

Refresh Token (long-lived: 7 days)
├── user_id
└── exp: current_time + 7d
```

### Protected Routes Pattern
```javascript
// Frontend
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Backend
router.use(requireAuth); // All routes below require JWT
```

### Password Security
- Hashed with bcryptjs (salt rounds: 10)
- Never logged or exposed in responses
- Reset links are one-time use tokens

### API Security
- **CORS**: Validated by origin
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: express-validator on all endpoints
- **SQL Injection Protection**: Sequelize parameterized queries
- **CSRF**: Handled by SameSite cookie policy

## Data Flow Examples

### 1. Gallery Upload Flow
```
1. User selects photos in browser
2. Frontend uploads to S3 via multer-s3
   └─→ onProgress callback updates UI
3. S3 returns signed URL
4. Frontend creates Photo records via API
5. ImageService processes derivatives
6. Frontend refetches gallery data
7. UI updates with new photos
```

### 2. Subscription Purchase Flow
```
1. User selects plan on /subscriptions
2. Frontend calls createCheckoutSession()
3. Backend creates Stripe Checkout session
4. Frontend redirects to Stripe Checkout
5. User completes payment
6. Stripe sends webhook to backend
7. Backend creates Subscription record
8. Email confirmation sent
9. Frontend redirected to success page
10. useSubscription hook detects new subscription
11. Dashboard updates with new plan features
```

### 3. Client Proofing Flow
```
1. Photographer creates proofing session
2. Generates one-time token for client
3. Sends client secure link
4. Client opens /proof/:token (no auth required)
5. Temporary session created
6. Client views photos, makes selections
7. Client submits feedback/comments
8. Photographer notified
9. Downloads approved photos with watermark
```

## Performance Considerations

### Database Optimization
- **Indexes**: Composite indexes on frequently-queried columns (user_id, created_at)
- **Eager Loading**: Sequelize associations preload related data
- **Query Pagination**: List endpoints return 50 items max
- **Connection Pooling**: Max 5 concurrent connections (Neon free tier)

### Frontend Optimization
- **Code Splitting**: Route-based lazy loading with React.lazy()
- **Image Optimization**: Sharp generates WebP versions
- **Caching**: React Query caches API responses
- **Bundle Size**: Main JS ~380 KB gzipped

### API Response Times
- Database queries: <50ms
- Image processing: <500ms per image
- API response: <200ms (typical)

## Deployment Architecture

### Frontend (Vercel)
- Automatic deployments from main branch
- CDN caching
- Serverless functions for dynamic routes

### Backend (Render)
- Node.js application
- PostgreSQL database (Neon)
- Redis cache (Upstash)
- AWS S3 for file storage

### Environment Variables
See `.env.example` - all required vars must be set before deployment

## Scaling Considerations

### Current Bottlenecks (for high traffic)
1. Database connection pool (only 5 connections)
   - Solution: Migrate to connection pooling service
2. Image processing (single-threaded Node)
   - Solution: Use Bull queues with worker processes
3. S3 upload limits
   - Solution: Multipart uploads, regional buckets

### Future Architecture
```
┌─────────────────────────────────────┐
│   Load Balancer (nginx/HAProxy)     │
└────────────────────┬────────────────┘
                     │
    ┌────────────────┼────────────────┐
    ▼                ▼                ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ API Server 1│ │ API Server 2│ │ API Server 3│
└─────────────┘ └─────────────┘ └─────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌──────────┐   ┌──────────┐   ┌────────────┐
│ Postgres │   │  Redis   │   │ S3 Bucket  │
│ Primary  │   │ Cluster  │   │ with CDN   │
└──────────┘   └──────────┘   └────────────┘
    │
    ▼
┌──────────┐
│ Postgres │
│ Replica  │
└──────────┘
```
