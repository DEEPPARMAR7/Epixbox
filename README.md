# EpixBox

EpixBox is a photography platform built as a full-stack monorepo. It includes a public marketing site, portfolio and gallery browsing, proofing, print and digital sales, subscriptions, dashboard tools, and backend services for uploads, storage, and commerce.

## What Is In This Repo

- `client/` - React + Vite frontend for the public site, portfolio pages, shop flow, proofing, and dashboard.
- `server/` - Express API, authentication, galleries, photos, orders, uploads, payments, subscriptions, and admin workflows.
- `docs/` - Setup and infrastructure notes.

## Public Experience

The public-facing site is built to feel complete before signup. Visitors can:

- Browse the homepage, features, pricing, apps, resources, about, support, and legal pages.
- Open a sample portfolio at `/p/demo`.
- Open sample galleries such as `/p/demo/weddings`.
- Preview a print purchase flow from the sample gallery.
- Start signup from any major public page.

## Core Product Areas

- Public marketing site and navigation
- Portfolio home and gallery browsing
- Client proofing and gallery access control
- Photo uploads, EXIF handling, and image derivatives
- Print, digital, and subscription commerce
- Order tracking, refunds, and admin transaction tools
- S3-backed storage and signed download links
- Feature gates and tiered plans

## Tech Stack

- Frontend: React 19, Vite, React Router, React Query, Tailwind CSS, Zustand, Stripe, Helmet
- Backend: Node.js, Express, Sequelize, PostgreSQL, Redis, Bull, Sharp, S3, Stripe, Socket.IO

## Prerequisites

- Node.js 20+ LTS
- npm
- PostgreSQL 14+
- Redis 6+ for queue-backed features
- AWS S3 credentials
- Stripe test or live keys
- SMTP/email credentials

## Setup

1. Install dependencies.

   ```bash
   npm install
   ```

2. Copy the env template.

   ```bash
   cp .env.example .env
   ```

3. Fill in the required variables in `.env`.

4. Create the database and run migrations.

   ```bash
   cd server
   npm run db:migrate
   ```

5. Start both apps.

   ```bash
   npm run dev
   ```

## Useful Scripts

From the repository root:

- `npm run dev` - start the server and client together.
- `npm run build` - build the client workspace.
- `npm run install:all` - install dependencies for root, client, and server.

Client workspace:

- `npm run dev --workspace=client`
- `npm run build --workspace=client`
- `npm run lint --workspace=client`

Server workspace:

- `npm run dev --workspace=server`
- `npm run start --workspace=server`
- `npm run db:migrate --workspace=server`

## Environment Variables

The repo includes a complete template in `.env.example`. Common values include:

- `NODE_ENV`
- `PORT`
- `CLIENT_URL`
- `FRONTEND_URL`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

## Key Routes

Public:

- `/`
- `/features`
- `/pricing`
- `/apps`
- `/resources`
- `/blog`
- `/support`
- `/about`
- `/contact`
- `/p/demo`
- `/p/demo/weddings`

App flows:

- `/signup`
- `/login`
- `/dashboard`
- `/cart`
- `/checkout`
- `/order-success`
- `/order-status`
- `/proof/:token`

## Project Notes

- The client build is the root `npm run build` target.
- The monorepo uses npm workspaces.
- Demo portfolio routes are implemented so the public site can be explored without an account.
- The root README documents the whole project; the `client/README.md` remains the frontend template docs.

## Development Links

- Client: `http://localhost:5173`
- Server: `http://localhost:4000`

## License

No license file is included in this repository.