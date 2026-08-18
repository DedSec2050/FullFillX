# FullFillX

<p align="center">
  <img src="https://img.shields.io/badge/FullFillX-Logistics%20%26%20Fulfillment-2563EB?style=for-the-badge" alt="FullFillX">
</p>

<p align="center">
  Modular, multi-tenant logistics and fulfillment platform built with TypeScript, Fastify, React, PostgreSQL, Prisma, Podman and cloud-native container deployment.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-7-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white">
  <img src="https://img.shields.io/badge/Fastify-5-000000?style=flat-square&logo=fastify&logoColor=white">
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white">
  <img src="https://img.shields.io/badge/Podman-892CA0?style=flat-square&logo=podman&logoColor=white">
  <img src="https://img.shields.io/badge/Azure-0078D4?style=flat-square&logo=microsoftazure&logoColor=white">
  <img src="https://img.shields.io/badge/AWS-FF9900?style=flat-square&logo=amazonaws&logoColor=white">
</p>

---

## 📌 Overview

**FullFillX** is a logistics and fulfillment management platform designed around modular business domains and tenant-aware API operations.

### Core capabilities

- 📦 Product management
- 🏷️ SKU management
- 🏭 Warehouse management
- 📊 Inventory management
- 🛒 Order management
- 🏢 Multi-tenant API support
- 📖 Swagger/OpenAPI documentation
- 🛡️ CORS and security headers
- 📝 Structured logging with Pino
- 🗄️ PostgreSQL persistence through Prisma
- 🦭 Podman-based containerization
- ☁️ Azure Container Apps deployment
- 📦 Azure Container Registry
- ☁️ AWS ECR support

---

## 🏗️ Architecture

```text
                         ┌──────────────────────────┐
                         │       Web Browser        │
                         │   React + Vite Frontend  │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │       Nginx :80          │
                         │   Static React Assets    │
                         └────────────┬─────────────┘
                                      │ HTTPS / HTTP
                                      ▼
                         ┌──────────────────────────┐
                         │    Fastify API :3000     │
                         │                          │
                         │ Products / SKU           │
                         │ Warehouse / Inventory    │
                         │ Orders                   │
                         │ Swagger / OpenAPI        │
                         └────────────┬─────────────┘
                                      │ Prisma
                                      ▼
                         ┌──────────────────────────┐
                         │       PostgreSQL         │
                         └──────────────────────────┘
```

### Cloud architecture

```text
                        Internet
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
   ┌─────────────────────┐     ┌─────────────────────┐
   │ Azure Container App │     │ Azure Container App │
   │      Frontend       │────►│        API          │
   │     Nginx :80       │     │    Fastify :3000    │
   └─────────────────────┘     └──────────┬──────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │ Azure PostgreSQL      │
                              │ Flexible Server       │
                              └──────────────────────┘

                    Container images
                           │
                           ▼
                 ┌─────────────────────┐
                 │ Azure Container      │
                 │ Registry (ACR)       │
                 └─────────────────────┘
```

---

## 🧰 Tech Stack

### Frontend

| Technology | Role |
|---|---|
| ⚛️ **React** | User interface |
| ⚡ **Vite** | Development server and production build |
| 🟦 **TypeScript** | Type-safe frontend code |
| 🌐 **Fetch API** | API communication |
| 🧭 **Nginx** | Production static-file server |

### Backend

| Technology | Role |
|---|---|
| 🟢 **Node.js** | Runtime |
| 🚀 **Fastify** | HTTP API framework |
| 🟦 **TypeScript** | Type-safe backend code |
| 🔷 **Prisma** | ORM/database client |
| 🐘 **PostgreSQL** | Relational database |
| 🧱 **Zod** | Runtime validation |
| 🛡️ **Helmet** | Security headers |
| 🌐 **CORS** | Cross-origin access control |
| 📖 **Swagger/OpenAPI** | API documentation |
| 📝 **Pino** | Structured logging |

### DevOps / Cloud

| Technology | Role |
|---|---|
| 🦭 **Podman** | OCI-compatible local container runtime |
| 📦 **pnpm** | Package manager and workspace management |
| ☁️ **Azure Container Apps** | Container deployment |
| 📦 **Azure Container Registry** | Container image registry |
| 🐘 **Azure Database for PostgreSQL** | Managed production database |
| 🔐 **Azure Managed Identity** | Passwordless ACR authentication |
| ☁️ **AWS ECR** | Alternative image registry |
| 🧪 **Vitest** | Testing |

---

## 📁 Project Structure

```text
FullFillX/
│
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── config/
│   │       │   └── env.ts
│   │       ├── plugins/
│   │       │   ├── prisma.ts
│   │       │   └── swagger.ts
│   │       ├── app.ts
│   │       └── server.ts
│   │
│   └── web/
│       ├── src/
│       ├── nginx.conf
│       ├── package.json
│       └── vite.config.ts
│
├── services/
│   ├── products/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── warehouse/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── inventory/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   └── order/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── presentation/
│
├── prisma/
│   └── schema.prisma
│
├── Containerfile.api
├── Containerfile.web
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
└── README.md
```

---

## 🧱 Backend Architecture

The backend uses a modular service-oriented structure.

Each business domain is isolated:

```text
services/
├── products/
├── warehouse/
├── inventory/
└── order/
```

The intended layering is:

```text
Presentation
     │
     ▼
Application
     │
     ▼
Domain
     │
     ▼
Infrastructure
     │
     ▼
Prisma / PostgreSQL
```

### Presentation

HTTP routes, request parsing and response handling.

### Application

Business use cases and orchestration.

### Domain

Business entities and rules.

### Infrastructure

Database repositories and external implementation details.

This keeps business logic independent from HTTP and database-specific code.

---

## 🏢 Multi-Tenancy

API requests support tenant identification through:

```http
x-tenant-id: <tenant-uuid>
```

Example:

```bash
curl http://localhost:3000/api/v1/orders \
  -H "x-tenant-id: 550e8400-e29b-41d4-a716-446655440000"
```

> **Security note:** A client-supplied tenant header should not be considered a trusted identity boundary by itself. In production, tenant identity should ultimately be derived from authenticated identity/authorization claims and enforced server-side.

---

## 📦 Functional Modules

### 📦 Products

Product catalog functionality and product-to-SKU relationships.

### 🏷️ SKUs

SKU-level product identification and management.

### 🏭 Warehouses

Warehouse entities and inventory-location relationships.

### 📊 Inventory

Inventory and stock operations at SKU/warehouse level.

### 🛒 Orders

Order retrieval and order-related operations, including tenant-aware access.

Example:

```http
GET /api/v1/orders
```

---

## 🔌 API

Local API:

```text
http://localhost:3000
```

### Health

```http
GET /health
```

```bash
curl http://localhost:3000/health
```

### Orders

```http
GET /api/v1/orders
```

```bash
curl http://localhost:3000/api/v1/orders \
  -H "x-tenant-id: 550e8400-e29b-41d4-a716-446655440000"
```

### Swagger

The API includes Swagger/OpenAPI integration through Fastify Swagger and Swagger UI.

---

## 🗄️ Database

FullFillX uses:

```text
PostgreSQL
     │
     ▼
  Prisma
     │
     ▼
Repositories
     │
     ▼
Application services
```

Local container networking uses:

```text
fulfillx-postgres
```

rather than:

```text
localhost
```

from inside the API container.

Example:

```env
DATABASE_URL=postgresql://postgres:postgres@fulfillx-postgres:5432/fulfillx
```

---

## 🔐 Environment Configuration

### API

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@fulfillx-postgres:5432/fulfillx
```

### Frontend

Vite variables are build-time values.

Example:

```env
VITE_API_URL=https://your-api-domain
```

Or directly during a Podman build:

```bash
podman build \
  --build-arg VITE_API_URL=https://your-api-domain \
  -f Containerfile.web \
  -t fulfillx-web:latest \
  .
```

**Never put database passwords, private keys, JWT secrets, or other secrets in `VITE_*` variables.** They become part of the browser bundle.

---

## 🦭 Local Podman Deployment

### 1. Create network

```bash
podman network create fulfillx-network 2>/dev/null || true
```

### 2. PostgreSQL

```bash
podman run -d \
  --name fulfillx-postgres \
  --network fulfillx-network \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fulfillx \
  -v fulfillx-postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine
```

### 3. API

```bash
podman build -f Containerfile.api -t fulfillx-api:latest .
```

```bash
podman rm -f fulfillx-api 2>/dev/null || true

podman run -d \
  --name fulfillx-api \
  --network fulfillx-network \
  -e DATABASE_URL="postgresql://postgres:postgres@fulfillx-postgres:5432/fulfillx" \
  -p 3000:3000 \
  fulfillx-api:latest
```

### 4. Frontend

```bash
podman build \
  --build-arg VITE_API_URL=http://localhost:3000 \
  -f Containerfile.web \
  -t fulfillx-web:latest \
  .
```

```bash
podman rm -f fulfillx-web 2>/dev/null || true

podman run -d \
  --name fulfillx-web \
  -p 8080:80 \
  fulfillx-web:latest
```

Open:

```text
http://localhost:8080
```

---

## 🌐 Frontend API Routing

The frontend resolves API URLs using `VITE_API_URL`.

```ts
function resolveApiUrl(path: string): string {
  const apiBaseUrl =
    (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

  if (!apiBaseUrl) {
    return path;
  }

  const normalizedPath =
    path.startsWith("/") ? path : `/${path}`;

  return `${apiBaseUrl}${normalizedPath}`;
}
```

### Local

```text
VITE_API_URL=""
```

The frontend uses relative URLs:

```text
/health
/api/v1/orders
```

### Azure

```text
VITE_API_URL=https://<azure-api-fqdn>
```

The browser directly calls:

```text
https://<azure-api-fqdn>/health
https://<azure-api-fqdn>/api/v1/orders
```

This is important because:

```text
fulfillx-api:3000
```

is a container-network hostname and is **not resolvable by a user's browser**.

---

## 🧭 Nginx

Production Nginx serves the compiled React application.

Recommended SPA configuration:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

When the frontend uses the Azure API FQDN through `VITE_API_URL`, Nginx does not need to proxy API traffic.

---

## ☁️ Azure Deployment

Current cloud architecture uses:

- Azure Container Registry
- Azure Container Apps
- Azure Database for PostgreSQL
- User-assigned Managed Identity
- ACR `AcrPull`

Example registry:

```text
fulfillxregistry.azurecr.io
```

Images:

```text
fulfillxregistry.azurecr.io/fulfillx-api:latest
fulfillxregistry.azurecr.io/fulfillx-web:latest
```

### API Container App

```text
Port: 3000
Ingress: External
```

The API receives its production database connection through:

```text
DATABASE_URL
```

The production database is hosted on Azure Database for PostgreSQL.

### ACR authentication

The Container App identity is granted:

```text
AcrPull
```

on the registry so Azure can pull private images without registry passwords.

---

## ☁️ AWS Container Registry Support

The same OCI images can be published to Amazon ECR.

Example repositories:

```text
fullfillx-api
fullfillx-web
```

Example API registry URL:

```text
833068513734.dkr.ecr.ap-south-1.amazonaws.com/fullfillx-api:latest
```

These images can subsequently be deployed through AWS container services such as ECS/Fargate with appropriate VPC, load balancer, IAM, and database infrastructure.

---

## 🧪 Testing

Run tests:

```bash
pnpm test
```

Watch mode:

```bash
pnpm test:watch
```

---

## 🛠️ Development Commands

Install dependencies:

```bash
pnpm install
```

Start API development:

```bash
pnpm dev
```

Build TypeScript:

```bash
pnpm build
```

Start compiled API:

```bash
pnpm start
```

Generate Prisma Client:

```bash
pnpm prisma:generate
```

Run Prisma migrations:

```bash
pnpm prisma:migrate
```

---

## 🔍 Health Checks

API:

```bash
curl http://localhost:3000/health
```

Frontend:

```bash
curl http://localhost:8080/health
```

Container status:

```bash
podman ps
```

API logs:

```bash
podman logs fulfillx-api
```

Frontend logs:

```bash
podman logs fulfillx-web
```

---

## 🔄 End-to-End Request Flow

```text
Browser
   │
   ▼
React
   │
   ▼
resolveApiUrl()
   │
   ├── Local
   │     └── relative /api or /health
   │
   └── Azure
         └── https://<api-fqdn>/api...
   │
   ▼
Fastify route
   │
   ▼
Application use case
   │
   ▼
Repository
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
```

---

## 🚀 Production Checklist

### Backend

- [x] Fastify API
- [x] PostgreSQL
- [x] Prisma
- [x] Modular services
- [x] Swagger/OpenAPI
- [x] Containerized API
- [x] Azure Container App
- [x] Azure PostgreSQL
- [x] Managed Identity / ACR pull
- [ ] Authentication and authorization
- [ ] Rate limiting
- [ ] Centralized secrets
- [ ] Observability/tracing
- [ ] Automated migrations
- [ ] Automated backups and restore testing
- [ ] Custom domain

### Frontend

- [x] React + Vite
- [x] Production Nginx image
- [x] Podman containerization
- [x] Azure-compatible API URL configuration
- [ ] Azure frontend Container App
- [ ] Custom domain
- [ ] Production CORS configuration
- [ ] CDN where appropriate

### Security

- [x] Helmet
- [x] CORS
- [x] HTTPS at cloud ingress
- [x] Managed Identity for registry access
- [ ] Authenticated tenant resolution
- [ ] RBAC
- [ ] Secret management
- [ ] Rate limiting
- [ ] Audit logging
- [ ] Least-privilege database credentials

---

## 🧭 Roadmap

### Phase 1 — Core Platform

- [x] Monorepo
- [x] Fastify API
- [x] React frontend
- [x] PostgreSQL
- [x] Prisma
- [x] Product module
- [x] SKU module
- [x] Warehouse module
- [x] Inventory module
- [x] Order module
- [x] Health endpoint
- [x] Swagger/OpenAPI
- [x] Podman containerization

### Phase 2 — Cloud

- [x] Container Registry
- [x] Azure Container Registry
- [x] Azure Container Apps
- [x] Azure PostgreSQL
- [x] Managed Identity
- [x] ACR pull permissions
- [x] Production API deployment
- [ ] Production frontend deployment
- [ ] Custom domains

### Phase 3 — Production Readiness

- [ ] Authentication
- [ ] Authorization/RBAC
- [ ] Strong tenant isolation
- [ ] Rate limiting
- [ ] Centralized secret management
- [ ] Observability
- [ ] Distributed tracing
- [ ] CI/CD
- [ ] Automated integration tests
- [ ] Security scanning
- [ ] Backup/restore automation

---

## 📜 Root Scripts

```bash
pnpm dev
pnpm build
pnpm start

pnpm test
pnpm test:watch

pnpm prisma:generate
pnpm prisma:migrate
```

---

## 📄 License

The project is currently configured with:

```text
ISC
```

---

## 👨‍💻 FullFillX

```text
React + Vite
      │
      ▼
    Nginx
      │
      ▼
Fastify + TypeScript
      │
      ▼
    Prisma
      │
      ▼
 PostgreSQL
      │
      ▼
Azure / AWS
```

**FullFillX — Modular logistics and fulfillment infrastructure.**
