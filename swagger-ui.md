# FulfillX — Swagger / OpenAPI Documentation Setup

This guide adds interactive Swagger UI documentation to the FulfillX Fastify API.

The setup uses:

- Node.js
- TypeScript
- Fastify 5
- `@fastify/swagger`
- `@fastify/swagger-ui`
- OpenAPI 3.0.3

---

# 1. Install Swagger Dependencies

From the project root:

```bash
pnpm add @fastify/swagger @fastify/swagger-ui
```

For Fastify 5, use compatible versions of the Fastify Swagger plugins.

Check installed versions:

```bash
pnpm list fastify @fastify/swagger @fastify/swagger-ui fastify-plugin
```

Expected major versions:

```text
fastify              5.x
@fastify/swagger     9.x
@fastify/swagger-ui  5.x
fastify-plugin       6.x
```

If required:

```bash
pnpm add @fastify/swagger@^9 @fastify/swagger-ui@^5 fastify-plugin@^6
```

---

# 2. Project Structure

Create a dedicated Swagger plugin:

```text
apps/
└── api/
    └── src/
        ├── plugins/
        │   ├── prisma.ts
        │   └── swagger.ts
        │
        ├── app.ts
        └── server.ts
```

Swagger configuration should remain separate from the application bootstrap logic.

---

# 3. Create the Swagger Plugin

Create:

```text
apps/api/src/plugins/swagger.ts
```

Use:

```typescript
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
        {
          name: "Products",
          description: "Product management",
        },
        {
          name: "SKUs",
          description: "SKU management",
        },
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

# 4. Register Swagger in the Application

Swagger should be registered before the API routes.

Example:

```typescript
import Fastify from "fastify";

import swaggerPlugin from "./plugins/swagger.js";

import { productRoutes } from "../../../services/products/presentation/product.routes.js";
import { skuRoutes } from "../../../services/products/presentation/sku.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  /*
   * Register Swagger before routes.
   */
  app.register(swaggerPlugin);

  /*
   * Health check
   */
  app.get("/health", async () => {
    return {
      status: "ok",
      service: "fulfillx-api",
    };
  });

  /*
   * API routes
   */
  app.register(productRoutes);
  app.register(skuRoutes);

  return app;
}
```

The important order is:

```text
Swagger
   │
   ▼
API Routes
```

Do not register Swagger after all routes.

---

# 5. Why Route Schemas Are Required

Fastify routes need JSON Schema information for Swagger/OpenAPI to describe:

- Path parameters
- Headers
- Request bodies
- Response bodies
- Validation rules
- Status codes

For example:

```typescript
app.post(
  "/api/v1/products",
  {
    schema: {
      tags: ["Products"],
      summary: "Create a product",
      ...
    },
  },
  async (request, reply) => {
    ...
  }
);
```

Swagger uses the route's `schema` definition to generate the OpenAPI documentation.

---

# 6. Product API Documentation

## Create Product

Add a schema to the Product creation route:

```typescript
app.post(
  "/api/v1/products",
  {
    schema: {
      tags: ["Products"],

      summary: "Create a product",

      description: "Creates a new product for the specified tenant.",

      headers: {
        type: "object",

        required: ["x-tenant-id"],

        properties: {
          "x-tenant-id": {
            type: "string",
            format: "uuid",
            description: "Tenant UUID",
          },
        },
      },

      body: {
        type: "object",

        required: ["name"],

        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            example: "iPhone 15",
          },
        },
      },

      response: {
        201: {
          description: "Product created successfully",

          type: "object",

          properties: {
            id: {
              type: "string",
              format: "uuid",
            },

            tenantId: {
              type: "string",
              format: "uuid",
            },

            name: {
              type: "string",
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
  },

  async (request, reply) => {
    // Existing implementation
  },
);
```

Swagger will display:

```text
POST /api/v1/products

Headers
└── x-tenant-id

Body
└── name

Response
├── id
├── tenantId
├── name
├── createdAt
└── updatedAt
```

---

# 7. List Products

```typescript
app.get(
  "/api/v1/products",
  {
    schema: {
      tags: ["Products"],

      summary: "List products",

      description: "Returns all products belonging to the specified tenant.",

      headers: {
        type: "object",

        required: ["x-tenant-id"],

        properties: {
          "x-tenant-id": {
            type: "string",
            format: "uuid",
            description: "Tenant UUID",
          },
        },
      },

      response: {
        200: {
          description: "Products returned successfully",

          type: "array",

          items: {
            type: "object",

            properties: {
              id: {
                type: "string",
                format: "uuid",
              },

              tenantId: {
                type: "string",
                format: "uuid",
              },

              name: {
                type: "string",
              },

              createdAt: {
                type: "string",
                format: "date-time",
              },

              updatedAt: {
                type: "string",
                format: "date-time",
              },
            },
          },
        },
      },
    },
  },

  async (request, reply) => {
    // Existing implementation
  },
);
```

---

# 8. Get Product

```typescript
app.get(
  "/api/v1/products/:productId",
  {
    schema: {
      tags: ["Products"],

      summary: "Get product",

      description: "Returns a product by its ID.",

      params: {
        type: "object",

        required: ["productId"],

        properties: {
          productId: {
            type: "string",
            format: "uuid",
            description: "Product UUID",
          },
        },
      },

      headers: {
        type: "object",

        required: ["x-tenant-id"],

        properties: {
          "x-tenant-id": {
            type: "string",
            format: "uuid",
            description: "Tenant UUID",
          },
        },
      },

      response: {
        200: {
          description: "Product found",

          type: "object",

          properties: {
            id: {
              type: "string",
              format: "uuid",
            },

            tenantId: {
              type: "string",
              format: "uuid",
            },

            name: {
              type: "string",
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        404: {
          description: "Product not found",
        },
      },
    },
  },

  async (request, reply) => {
    // Existing implementation
  },
);
```

---

# 9. SKU API Documentation

## Create SKU

The `productId` comes from the URL.

The SKU request body contains only:

```json
{
  "sku": "IPHONE15-BLK-128",
  "name": "iPhone 15 Black 128GB"
}
```

Route:

```typescript
app.post(
  "/api/v1/products/:productId/skus",
  {
    schema: {
      tags: ["SKUs"],

      summary: "Create SKU",

      description: "Creates a SKU belonging to an existing product.",

      params: {
        type: "object",

        required: ["productId"],

        properties: {
          productId: {
            type: "string",
            format: "uuid",
            description: "Product UUID",
          },
        },
      },

      body: {
        type: "object",

        required: ["sku", "name"],

        properties: {
          sku: {
            type: "string",
            minLength: 1,
            maxLength: 100,
            example: "IPHONE15-BLK-128",
          },

          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            example: "iPhone 15 Black 128GB",
          },
        },
      },

      response: {
        201: {
          description: "SKU created successfully",

          type: "object",

          properties: {
            id: {
              type: "string",
              format: "uuid",
            },

            productId: {
              type: "string",
              format: "uuid",
            },

            sku: {
              type: "string",
            },

            name: {
              type: "string",
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        409: {
          description: "SKU already exists for this product",
        },
      },
    },
  },

  async (request, reply) => {
    // Existing implementation
  },
);
```

---

# 10. List SKUs

```typescript
app.get(
  "/api/v1/products/:productId/skus",
  {
    schema: {
      tags: ["SKUs"],

      summary: "List SKUs",

      description: "Returns all SKUs belonging to a product.",

      params: {
        type: "object",

        required: ["productId"],

        properties: {
          productId: {
            type: "string",
            format: "uuid",
            description: "Product UUID",
          },
        },
      },

      response: {
        200: {
          description: "SKUs returned successfully",

          type: "array",

          items: {
            type: "object",

            properties: {
              id: {
                type: "string",
                format: "uuid",
              },

              productId: {
                type: "string",
                format: "uuid",
              },

              sku: {
                type: "string",
              },

              name: {
                type: "string",
              },

              createdAt: {
                type: "string",
                format: "date-time",
              },

              updatedAt: {
                type: "string",
                format: "date-time",
              },
            },
          },
        },
      },
    },
  },

  async (request, reply) => {
    // Existing implementation
  },
);
```

---

# 11. Start the API

From the project root:

```bash
pnpm dev
```

Expected:

```text
Server listening at http://localhost:3000
```

---

# 12. Open Swagger UI

Open:

```text
http://localhost:3000/docs
```

Swagger UI should display:

```text
FulfillX API
1.0.0

Products
├── POST /api/v1/products
├── GET  /api/v1/products
└── GET  /api/v1/products/{productId}

SKUs
├── POST /api/v1/products/{productId}/skus
└── GET  /api/v1/products/{productId}/skus
```

You can use:

```text
Try it out
    ↓
Enter parameters
    ↓
Execute
```

to call the local API directly.

---

# 13. Generated OpenAPI Specification

The Swagger plugin also exposes the generated OpenAPI specification.

JSON:

```text
http://localhost:3000/docs/json
```

YAML:

```text
http://localhost:3000/docs/yaml
```

These can be used with:

- Postman
- Insomnia
- API clients
- OpenAPI generators
- Frontend SDK generators
- CI/CD API validation

---

# 14. Swagger Route Structure

The final API documentation structure should look like:

```text
FulfillX API
│
├── Products
│   │
│   ├── POST /api/v1/products
│   │      Create Product
│   │
│   ├── GET /api/v1/products
│   │      List Products
│   │
│   └── GET /api/v1/products/:productId
│          Get Product
│
└── SKUs
    │
    ├── POST /api/v1/products/:productId/skus
    │      Create SKU
    │
    └── GET /api/v1/products/:productId/skus
           List SKUs
```

---

# 15. Current Demo Data

## Tenant

```text
Name:
Test Merchant

ID:
550e8400-e29b-41d4-a716-446655440000
```

## Product

```text
Name:
iPhone 15

ID:
2ad818aa-a7b7-407c-ba82-bb1f1e91955c
```

## SKU

```text
Name:
iPhone 15 Black 128GB

SKU:
IPHONE15-BLK-128

ID:
cc32158b-8812-44dd-88b1-84bb02d03a9c
```

---

# 16. Testing Through Swagger UI

## Create Product

In Swagger:

```text
Products
    ↓
POST /api/v1/products
    ↓
Try it out
```

Header:

```text
x-tenant-id:
550e8400-e29b-41d4-a716-446655440000
```

Body:

```json
{
  "name": "MacBook Air M4"
}
```

Click:

```text
Execute
```

---

## Create SKU

Open:

```text
SKUs
    ↓
POST /api/v1/products/{productId}/skus
    ↓
Try it out
```

Set:

```text
productId:
2ad818aa-a7b7-407c-ba82-bb1f1e91955c
```

Body:

```json
{
  "sku": "IPHONE15-BLU-128",
  "name": "iPhone 15 Blue 128GB"
}
```

Click:

```text
Execute
```

---

# 17. Zod vs Swagger Schemas

FulfillX currently has two schema systems:

```text
                    Request
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
           Zod             Fastify JSON Schema
             │                   │
             ▼                   ▼
       Runtime Validation    OpenAPI/Swagger
```

Zod is responsible for runtime validation.

Fastify JSON Schema is used by Swagger/OpenAPI for API documentation and Fastify's schema system.

For example:

```typescript
const createSKUSchema = z.object({
  sku: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(255),
});
```

while the Swagger schema describes the same request:

```typescript
body: {
  type: "object",

  required: ["sku", "name"],

  properties: {
    sku: {
      type: "string",
      minLength: 1,
      maxLength: 100,
    },

    name: {
      type: "string",
      minLength: 1,
      maxLength: 255,
    },
  },
}
```

For the current small API this is acceptable.

As the application grows, consider using a schema integration approach that allows the validation schema to be the single source of truth.

---

# 18. Important Registration Order

The application should register plugins in this order:

```text
Fastify
   │
   ▼
Core Plugins
   │
   ├── Prisma
   ├── Error Handler
   └── Swagger
   │
   ▼
Routes
   │
   ├── Product Routes
   ├── SKU Routes
   ├── Warehouse Routes
   ├── Inventory Routes
   └── Order Routes
```

Swagger should be registered before the routes that need to be included in the generated OpenAPI specification.

---

# 19. Recommended Future Documentation Structure

As FulfillX grows, add tags for each domain:

```typescript
tags: [
  {
    name: "Products",
    description: "Product management",
  },

  {
    name: "SKUs",
    description: "SKU management",
  },

  {
    name: "Warehouses",
    description: "Warehouse management",
  },

  {
    name: "Inventory",
    description: "Inventory management",
  },

  {
    name: "Orders",
    description: "Order management",
  },

  {
    name: "Users",
    description: "User management",
  },
];
```

This will produce a clean Swagger UI:

```text
FulfillX API

Products
SKUs
Warehouses
Inventory
Orders
Users
```

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

Swagger
    ├── OpenAPI configuration
    ├── Swagger UI
    ├── Product schemas
    └── SKU schemas
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
