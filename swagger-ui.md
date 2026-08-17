# FulfillX — Swagger / OpenAPI setup

This project exposes Swagger UI at `/docs` using Fastify and the Fastify OpenAPI plugins.

Current setup:

- Fastify 5
- `@fastify/swagger`
- `@fastify/swagger-ui`
- Fastify plugin registration for the API app

---

## 1. Swagger plugin

The OpenAPI plugin is registered in:

```ts
apps / api / src / plugins / swagger.ts;
```

Current implementation:

```ts
import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyPluginAsync } from "fastify";

const swaggerPlugin: FastifyPluginAsync = async (app) => {
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "FulfillX API",
        description: "Fulfillment and inventory management API",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local development",
        },
      ],
      tags: [
        { name: "Products", description: "Product management" },
        { name: "SKUs", description: "SKU management" },
        { name: "Warehouses", description: "Warehouse management" },
        { name: "Inventory", description: "Inventory management" },
        { name: "Orders", description: "Order management" },
      ],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
    staticCSP: true,
  });
};

export default fp(swaggerPlugin, {
  name: "swagger",
});
```

---

## 2. App registration order

The app registers Swagger before route registration in:

```ts
apps / api / src / app.ts;
```

Current setup:

```ts
import Fastify from "fastify";
import swaggerPlugin from "./plugins/swagger.js";
import { productRoutes } from "../../../services/products/presentation/product.routes.js";
import { skuRoutes } from "../../../services/products/presentation/sku.routes.js";
import { warehouseRoutes } from "../../../services/warehouse/presentation/warehouse.routes.js";
import { inventoryRoutes } from "../../../services/inventory/presentation/inventory.routes.js";
import { orderRoutes } from "../../../services/order/presentation/order.routes.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(swaggerPlugin);

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "fulfillx-api",
    };
  });

  app.register(productRoutes);
  app.register(skuRoutes);
  app.register(warehouseRoutes);
  app.register(inventoryRoutes);
  app.register(orderRoutes);

  return app;
}
```

This ensures `/docs` reflects all active routes, including the newest order endpoints.

---

## 3. Swagger UI

Open the docs here:

```text
http://localhost:3000/docs
```

The generated UI includes these domain groups:

```text
Products
SKUs
Warehouses
Inventory
Orders
```

The current routes exposed in the generated OpenAPI document include:

```text
GET    /health
POST   /api/v1/products
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products/:productId/skus
GET    /api/v1/products/:productId/skus
POST   /api/v1/warehouses
GET    /api/v1/warehouses
GET    /api/v1/warehouses/:warehouseId
POST   /api/v1/warehouses/:warehouseId/inventory
GET    /api/v1/warehouses/:warehouseId/inventory
GET    /api/v1/warehouses/:warehouseId/inventory/:inventoryId
POST   /api/v1/warehouses/:warehouseId/inventory/:inventoryId/add-stock
POST   /api/v1/warehouses/:warehouseId/inventory/:inventoryId/reserve
POST   /api/v1/warehouses/:warehouseId/inventory/:inventoryId/release
POST   /api/v1/warehouses/:warehouseId/inventory/:inventoryId/fulfill
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/:orderId
POST   /api/v1/orders/:orderId/confirm
POST   /api/v1/orders/:orderId/allocate
POST   /api/v1/orders/:orderId/fulfill
```

---

## 4. Current schema conventions

The routes use Fastify JSON Schema for Swagger metadata, while runtime validation is still handled separately in Zod in the route modules.

Example pattern:

```ts
app.post("/api/v1/orders", {
  schema: {
    tags: ["Orders"],
    summary: "Create an order",
    description: "Creates a new order in PENDING status.",
    headers: {
      type: "object",
      required: ["x-tenant-id"],
      properties: {
        "x-tenant-id": { type: "string", format: "uuid" },
      },
    },
    body: {
      type: "object",
      required: ["storeId", "externalId", "items"],
      properties: {
        storeId: { type: "string", format: "uuid" },
        externalId: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["skuId", "quantity", "unitPrice"],
            properties: {
              skuId: { type: "string", format: "uuid" },
              quantity: { type: "integer", minimum: 1 },
              unitPrice: { type: "number", minimum: 0 },
            },
          },
        },
      },
    },
    response: {
      201: { description: "Order created successfully", type: "object" },
      400: { description: "Invalid order request", type: "object" },
      404: { description: "Store or SKU not found", type: "object" },
    },
  },
});
```

---

## 5. OpenAPI spec endpoints

The generated OpenAPI documents are available here:

```text
http://localhost:3000/docs/json
http://localhost:3000/docs/yaml
```

These are the raw outputs used by clients, docs generators, and external tooling.

---

## 6. Notes for the current codebase

- Swagger is intentionally documented alongside the route schema and not as a separate, static spec file.
- The project currently uses the `x-tenant-id` header for tenant-based access in product, warehouse, and order flows.
- Inventory routes are warehouse-scoped and allow stock transitions such as add, reserve, release, and fulfill.
- Order routes are now part of the public Swagger docs and should stay in sync with the route implementations.

---

# 20. Current API Documentation Status

```text
Product API
    ├── Create Product       ✅
    ├── List Products        ✅
    └── Get Product          ✅

SKU API
    ├── Create SKU           ✅
    └── List SKUs            ✅

Warehouse API
    ├── Create Warehouse     ✅
    ├── List Warehouses      ✅
    └── Get Warehouse        ✅

Inventory API
    ├── Create Inventory     ✅
    ├── List Inventory       ✅
    ├── Get Inventory        ✅
    ├── Add Stock            ✅
    └── Reserve Stock        ✅

Swagger
    ├── OpenAPI configuration
    ├── Swagger UI
    ├── Product schemas
    ├── SKU schemas
    ├── Warehouse schemas
    └── Inventory schemas
```

The next domains can follow the same documentation pattern:

```text
Warehouse
    ↓
Inventory
    ↓
Orders
    ↓
Allocation
    ↓
Fulfillment
```

Each domain should expose its routes through Fastify and document them through OpenAPI/Swagger.
