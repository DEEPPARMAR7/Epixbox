# EpixBox

> A full-stack photography platform for photographers to showcase portfolios,
> manage galleries, handle client proofing, and process orders.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/License-Proprietary-lightgrey?style=flat-square)

## Overview

EpixBox is a monorepo containing a React/Vite client and a Node.js/Express
API. The application supports photographer portfolios, galleries, private
proofing workflows, photo downloads, orders, subscriptions, and administration.

The current public deployment is:

```text
Vercel frontend -> Render API -> Neon PostgreSQL + AWS S3
```

The repository also contains Docker, Docker Compose, Docker Desktop Kubernetes,
Terraform, and GitHub Actions configuration for local DevOps practice and
validation. The local Kubernetes and Terraform configurations are not the
public production deployment.

## Features

- Portfolio and gallery management
- Public and private gallery access
- Client proofing, photo selections, comments, and approvals
- Image uploads, processing, downloads, and watermark support
- Orders, products, inventory, coupons, shipping, and analytics
- Subscription plans and account feature gates
- Razorpay checkout, subscription, and webhook integration
- JWT authentication, role-based access, rate limiting, and validation
- Admin dashboard and Swagger API documentation
- Socket.IO real-time communication
- AWS S3-compatible object storage with signed URLs

## Technology Stack

### Application

- React 19, Vite, React Router, Zustand, and Tailwind CSS
- Node.js 20, Express, Sequelize, and PostgreSQL
- Socket.IO for real-time communication
- Sharp for image processing
- AWS SDK for S3 storage
- JWT, bcrypt, Helmet, CORS, and express-rate-limit
- Nodemailer for email
- Razorpay SDK for the documented payment integration
- Swagger UI and Swagger JSDoc for API documentation

### DevOps and deployment

- Docker and Docker Compose
- Nginx for the client container
- Kubernetes with Docker Desktop Kubernetes
- GitHub Actions CI/CD
- Terraform configuration for a future AWS VPC, ECR, S3, and EKS setup
- Vercel frontend hosting and Render API hosting
- Neon PostgreSQL and AWS S3 in the hosted architecture

## Repository Structure

```text
.
├── .github/workflows/       # GitHub Actions CI/CD
├── client/                  # React/Vite frontend
│   ├── src/
│   └── scripts/
├── server/                  # Express API
│   ├── config/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── services/
├── docker/                  # Nginx configuration
├── k8s/                     # Local Kubernetes manifests
├── terraform/               # Plan-only AWS foundation
├── Dockerfile.client        # Client build and Nginx runtime image
├── Dockerfile.server        # API runtime image
├── docker-compose.yml       # Local two-container deployment
├── render.yaml              # Render API service configuration
├── vercel.json              # Vercel SPA and API proxy configuration
├── start-all.ps1            # Windows development launcher
└── package.json             # npm workspace configuration
```

## Prerequisites

For normal development:

- Node.js 20 or newer
- npm
- PostgreSQL-compatible database, or a Neon `DATABASE_URL`

For the local container and Kubernetes workflows:

- Docker Desktop
- Docker Desktop Kubernetes enabled with the `docker-desktop` context
- `kubectl`

For Terraform validation only:

- Terraform CLI
- AWS credentials are **not** required for `init -backend=false` or `validate`

## Getting Started

Install dependencies from the repository root:

```bash
npm install
```

Configure the server environment. Use `server/.env` locally and never commit
real credentials. The required values commonly include:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=replace-me
JWT_REFRESH_SECRET=replace-me
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=replace-me
AWS_SECRET_ACCESS_KEY=replace-me
S3_BUCKET_NAME=replace-me
```

Run migrations only against the intended development database:

```bash
cd server
npm run db:migrate
cd ..
```

Start the frontend and API together:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000`
- API health check: `http://localhost:4000/health`

On Windows, `npm run oneclick` uses [start-all.ps1](./start-all.ps1) to open
the development processes and checkout flow.

## Available Scripts

### Root

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the client and API in development |
| `npm run build` | Build the client |
| `npm run start` | Start the API |
| `npm run install:all` | Install root and workspace dependencies |
| `npm run oneclick` | Start the Windows development flow |

### Client

```bash
npm run dev --workspace=client
npm run build --workspace=client
npm run preview --workspace=client
```

### Server

```bash
npm run dev --workspace=server
npm run start --workspace=server
npm run db:migrate --workspace=server
npm run db:migrate:undo --workspace=server
npm run load:test --workspace=server
npm run test:razorpay-webhook --workspace=server
```

## API and Payment Notes

The API is mounted under `/api/v1`. Swagger documentation is available at
`/api/docs` or `/api/v1/docs` when the API is running.

Implemented API areas include authentication, galleries, photos, proofing,
portfolio, uploads, orders, products, inventory, shipping, analytics,
subscriptions, payment methods, refunds, checkout, and administration.

Razorpay is the payment integration documented for this project. Configure its
credentials only when testing checkout or subscriptions:

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=replace-me
RAZORPAY_WEBHOOK_SECRET=replace-me
```

The server includes a signed webhook test helper:

```bash
cd server
npm run test:razorpay-webhook
```

## Docker Compose

The Compose setup runs the client behind Nginx and the API as a separate
container. Neon remains the external PostgreSQL provider; Compose does not
create a local database.

Ensure the required API values are available in `server/.env`, then run:

```bash
docker compose up --build
```

Open `http://localhost:8080`. Nginx serves the SPA and proxies `/api` and
Socket.IO traffic to the API container. To stop the stack:

```bash
docker compose down
```

The Compose setup is intended for local learning and validation. It does not
replace the hosted Vercel and Render deployment.

## Local Kubernetes with Docker Desktop

The `k8s/` directory contains manifests for running the API and client images
on Docker Desktop Kubernetes. This is a single-node local learning environment,
not the public production cluster.

Enable Kubernetes in Docker Desktop, select the kubeadm provisioning method,
and verify the context:

```powershell
kubectl config use-context docker-desktop
kubectl get nodes
```

Build the images into Docker Desktop's local image store:

```powershell
docker build -f Dockerfile.server -t epic-api:latest .
docker build -f Dockerfile.client -t epic-client:latest .
```

Create the ignored local Secret from the safe template, replace its placeholder
values, and apply the manifests:

```powershell
Copy-Item k8s/secret.example.yaml.template k8s/secret.yaml
# Edit k8s/secret.yaml; do not commit it.
kubectl apply -f k8s/
```

Check the resources and rollouts:

```powershell
kubectl get pods -n epixbox
kubectl get services -n epixbox
kubectl rollout status deployment/epixbox-api -n epixbox
kubectl rollout status deployment/epixbox-client -n epixbox
```

The client is exposed through a local NodePort:

```powershell
kubectl get service client -n epixbox
# Open http://localhost:<NodePort>, for example http://localhost:31161
```

The API uses `/health` probes and the client uses `/healthz`. ConfigMaps hold
non-secret settings; the Secret holds database and JWT values. The local
configuration uses `AUTO_MIGRATE=false` and
`ALLOW_PENDING_MIGRATIONS=true`. This prevents deferred schema changes from
being applied automatically to the existing Neon database.

The current API manifest uses host networking as a local connectivity
workaround. Review and redesign that setting before using the manifest in a
cloud Kubernetes cluster.

Minikube was previously used for local testing but is no longer the active
local cluster. Use the Docker Desktop `docker-desktop` context.

## Terraform AWS Foundation

The `terraform/` directory is a plan-only AWS foundation for future learning
and deployment. It defines:

- VPC and public/private subnets
- NAT gateway configuration
- ECR repositories
- Private encrypted and versioned S3 storage
- EKS cluster and managed node group

It is not connected to the existing Vercel, Render, or Neon resources. No AWS
resources are created by CI. Validate it locally with:

```powershell
terraform -chdir=terraform init -backend=false
terraform -chdir=terraform validate
terraform -chdir=terraform plan
```

Do not run `terraform apply` without reviewing AWS costs, IAM permissions,
networking, and the production architecture. EKS, NAT gateways, load
balancers, and worker nodes can create charges.

## CI/CD

GitHub Actions runs on pushes and pull requests targeting `main`. The workflow
currently:

1. Installs dependencies with `npm ci`
2. Builds the React client
3. Builds the API Docker image
4. Builds the client Docker image
5. Validates Kubernetes manifests with Kubeconform
6. Checks Terraform formatting
7. Initializes Terraform without a backend
8. Validates Terraform configuration

## Hosted Deployment

### Vercel

Vercel hosts the frontend. [vercel.json](./vercel.json) provides SPA fallback
behavior and proxies `/api/:path*` requests to the Render API.

### Render

Render hosts the Node.js API using [render.yaml](./render.yaml). Production
startup uses:

```env
AUTO_MIGRATE=false
ALLOW_PENDING_MIGRATIONS=true
```

This is intentional because pending migrations include changes that require
review before they are applied to the existing production database. Do not
enable automatic migrations in production without a backup and a controlled
migration plan.

### Data safety

The hosted database is Neon PostgreSQL and file storage uses AWS S3. The
Docker, Kubernetes, and Terraform workflows must not be used to replace or
reset the existing hosted data. Never run destructive database commands such
as `DROP`, `TRUNCATE`, or Sequelize `sync({ force: true })` against production.

## Validation

Useful local checks include:

```bash
npm run build
git diff --check
```

For a server load test:

```bash
cd server
npm run load:test
```

## Contributing

1. Create a feature branch.
2. Make a focused change.
3. Run the relevant build, validation, or test commands.
4. Push the branch and open a pull request.

## License

Proprietary — All rights reserved. This repository is not open source.

---

**Last Updated:** October 18, 2026
