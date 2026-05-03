# EpixBox

> A comprehensive photography platform for professional photographers to showcase portfolios, manage galleries, handle client proofing, and process orders—all in one place.

![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-19+-blue?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/License-Proprietary-lightgrey?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Setup](#project-setup)
- [Available Scripts](#available-scripts)
- [Environment Configuration](#environment-configuration)
- [API Routes](#api-routes)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

EpixBox is a full-stack photography platform built as a modern monorepo, combining frontend and backend in a unified development experience. It provides photographers with complete control over their portfolios, client workflows, and e-commerce operations.

**Key Characteristics:**
- Public-facing marketing site with complete user experience before signup
- Professional portfolio and gallery browsing system
- Advanced client proofing and approval workflows
- Integrated e-commerce for prints, digital products, and subscriptions
- Admin dashboard for comprehensive gallery and order management
- Enterprise-grade image storage and processing

---

## ✨ Features

### 📸 Portfolio & Gallery Management
- Create and organize multiple galleries
- Customizable portfolio layouts (grid, masonry, slideshow)
- Public and private gallery access control
- EXIF data preservation and display
- Image derivative generation and optimization

### 👥 Client Proofing System
- Secure client-only gallery links
- Photo ratings and approvals
- Client-side commenting and feedback
- Organized approval workflows
- Download management and watermarking options

### 🛍️ E-Commerce Integration
- Print and product customization
- Digital product sales
- Subscription management
- Stripe payment processing
- Order tracking and fulfillment
- Refund and dispute handling

### 📊 Admin Dashboard
- Gallery and photo management
- Client and contact database
- Order and revenue analytics
- Subscription tier management
- Feature gates and plan-based access control

### 🔐 Security & Access Control
- JWT-based authentication
- Role-based access control (RBAC)
- S3-backed secure file storage
- Signed download links with expiration
- Rate limiting and abuse protection

---

## 📁 Project Structure

```
.
├── client/                    # React + Vite frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── stores/           # Zustand state management
│   │   ├── services/         # API client services
│   │   └── styles/           # Global styles and Tailwind config
│   └── package.json
├── server/                    # Express.js backend application
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── models/           # Sequelize database models
│   │   ├── middleware/       # Express middleware
│   │   ├── services/         # Business logic
│   │   ├── controllers/      # Request handlers
│   │   └── config/           # Configuration files
│   ├── migrations/           # Database migrations
│   └── package.json
├── docs/                      # Documentation and infrastructure guides
├── .env.example              # Environment variables template
└── package.json              # Root workspace configuration
```

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19 with Vite bundler
- **Routing:** React Router v6
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **UI Components:** Custom + Tailwind utilities
- **Image Handling:** Exifr for metadata, React Masonry CSS for layouts
- **Payments:** Stripe.js
- **Drag & Drop:** React Beautiful DND
- **SEO:** Helmet for meta tags

### Backend
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Caching:** Redis
- **Job Queue:** Bull queue
- **Image Processing:** Sharp
- **Storage:** AWS S3
- **Payments:** Stripe Node SDK
- **Authentication:** JWT
- **Real-time:** Socket.IO
- **Email:** SMTP integration

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Purpose |
|---|---|---|
| **Node.js** | 20.x LTS or newer | JavaScript runtime |
| **npm** | 10.x+ | Package manager |
| **PostgreSQL** | 14+ | Primary database |
| **Redis** | 6+ | Queue and cache backend |
| **AWS S3** | N/A | Image storage |
| **Stripe Account** | N/A | Payment processing |
| **SMTP Server** | N/A | Transactional emails |

---

## 🚀 Getting Started

### Quick Start (5 minutes)

```bash
# 1. Clone and install
git clone <repository-url>
cd Epic
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Initialize database
cd server
npm run db:migrate
cd ..

# 4. Start development servers
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000

---

## 🔧 Project Setup

### Detailed Setup Steps

#### 1. **Install Dependencies**
```bash
npm install
```

The monorepo uses npm workspaces. Dependencies are installed at root, client, and server levels.

#### 2. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` with your actual configuration (see [Environment Configuration](#environment-configuration) below).

#### 3. **Database Initialization**
```bash
cd server
npm run db:migrate
cd ..
```

This creates the database schema and runs all pending migrations.

#### 4. **Optional: Seed Demo Data**
```bash
cd server
npm run db:seed
cd ..
```

Creates sample users, galleries, and test data for development.

---

## 📝 Available Scripts

### Root Commands
| Command | Purpose |
|---|---|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run build` | Build the production client bundle |
| `npm run install:all` | Install all workspace dependencies |
| `npm run lint` | Lint all workspaces |

### Client Workspace (`--workspace=client`)
| Command | Purpose |
|---|---|
| `npm run dev --workspace=client` | Start Vite dev server (port 5173) |
| `npm run build --workspace=client` | Build optimized production bundle |
| `npm run preview --workspace=client` | Preview production build locally |
| `npm run lint --workspace=client` | Run ESLint on frontend code |
| `npm run type-check --workspace=client` | TypeScript type checking |

### Server Workspace (`--workspace=server`)
| Command | Purpose |
|---|---|
| `npm run dev --workspace=server` | Start Express server in development (port 4000) |
| `npm run start --workspace=server` | Start Express server in production |
| `npm run db:migrate --workspace=server` | Run pending database migrations |
| `npm run db:seed --workspace=server` | Populate database with test data |
| `npm run lint --workspace=server` | Run ESLint on backend code |

---

## 🔐 Environment Configuration

Create a `.env` file in the project root. Refer to `.env.example` for the complete template.

### Core Configuration
```env
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:5173
```

### Database
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=epixbox_dev
DB_USER=postgres
DB_PASSWORD=your_password
```

### Authentication
```env
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### AWS S3 Storage
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=epixbox-production
```

### Stripe Payments
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Email Configuration
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
EMAIL_FROM=noreply@epixbox.com
```

### Redis Queue
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

## 🗺️ API Routes

### Authentication Routes
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/logout` | User logout |

### Portfolio Routes
| Method | Route | Description |
|---|---|---|
| GET | `/api/portfolio/:username` | Get portfolio details |
| GET | `/api/portfolio/:username/galleries` | List galleries |
| GET | `/api/galleries/:id` | Get gallery details |
| GET | `/api/galleries/:id/photos` | Get gallery photos |

### Client Proofing Routes
| Method | Route | Description |
|---|---|---|
| GET | `/api/proof/:token` | Access proof link |
| POST | `/api/proof/:token/approve` | Approve photos |
| POST | `/api/proof/:token/comment` | Add comments |

### Orders & Commerce
| Method | Route | Description |
|---|---|---|
| POST | `/api/orders` | Create order |
| GET | `/api/orders/:id` | Get order details |
| POST | `/api/checkout` | Process checkout |
| POST | `/api/payments/webhook` | Stripe webhook handler |

### Admin Dashboard
| Method | Route | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Dashboard analytics |
| GET | `/api/admin/galleries` | Manage galleries |
| POST | `/api/admin/galleries` | Create gallery |
| PUT | `/api/admin/galleries/:id` | Update gallery |
| DELETE | `/api/admin/galleries/:id` | Delete gallery |

---

## 💻 Development

### Project Philosophy
- **Public-First Design:** The entire platform is accessible before user signup
- **Modular Architecture:** Client and server are separate workspaces with clear boundaries
- **Real-time Updates:** Socket.IO for live notifications and status updates
- **Scalable Storage:** S3 for images with CDN-ready signed URLs
- **Security-Focused:** JWT auth, role-based access, rate limiting, input validation

### Debugging
Enable debug logging:
```bash
DEBUG=epixbox:* npm run dev
```

### Testing
```bash
# Run test suite
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Code Quality
```bash
# Lint all code
npm run lint

# Format with Prettier
npm run format

# Type check (TypeScript)
npm run type-check
```

---

## 🚢 Deployment

### Building for Production
```bash
npm run build
```

Outputs optimized bundles to:
- **Frontend:** `client/dist/`
- **Backend:** Ready to deploy server directory

### Deployment Checklist
- [ ] All environment variables configured in production
- [ ] Database migrations applied: `npm run db:migrate`
- [ ] Redis instance running and accessible
- [ ] S3 bucket created and IAM credentials set
- [ ] Stripe webhooks configured
- [ ] SSL/TLS certificates installed
- [ ] Error logging and monitoring configured
- [ ] Backups scheduled for database and S3

See [DEPLOYMENT_RUNBOOK.md](./DEPLOYMENT_RUNBOOK.md) for detailed deployment instructions.

---

## 📚 Additional Documentation

- **[DEPLOYMENT_RUNBOOK.md](./DEPLOYMENT_RUNBOOK.md)** — Complete deployment guide
- **[TECHNICAL_DEBT.md](./TECHNICAL_DEBT.md)** — Known issues and improvement areas
- **[docs/](./docs/)** — Architecture and infrastructure documentation

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request with description

**Code Standards:**
- Follow ESLint configuration
- Write meaningful commit messages
- Include tests for new features
- Update documentation as needed

---

## 📄 License

Proprietary — All rights reserved. This repository is not open source.

---

## ✉️ Support

For questions or issues, please reach out to the development team or check the [docs/](./docs/) directory for additional resources.

---

**Last Updated:** May 3, 2026 | **Status:** Active Development
