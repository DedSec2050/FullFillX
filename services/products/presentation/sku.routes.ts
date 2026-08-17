import type { FastifyInstance } from "fastify";
import { prisma } from "../../../apps/api/src/plugins/prisma.js";

import { PrismaSKURepository } from "../infrastructure/prisma-sku-repository.js";
import { CreateSKU } from "../application/create-sku.js";
import { ListSKU } from "../application/list-sku.js";

import { createSKUSchema, productIdParamsSchema } from "./sku.schemas.js";

export async function skuRoutes(app: FastifyInstance) {
  const repository = new PrismaSKURepository(prisma);

  const createSKU = new CreateSKU(repository);
  const listSKU = new ListSKU(repository);

  app.post(
    "/api/v1/products/:productId/skus",
    {
      schema: {
        tags: ["SKUs"],
        summary: "Create a SKU for a product",
        description: "Creates a new SKU for the specified product.",
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
              description: "SKU code",
            },
            name: {
              type: "string",
              minLength: 1,
              maxLength: 100,

              description: "SKU name",
            },
          },
        },
        response: {
          201: {
            description: "SKU created successfully",
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              sku: { type: "string" },
              name: { type: "string" },
              productId: { type: "string", format: "uuid" },
            },
          },
          400: {
            description:
              "Invalid request body or parameters. Please check the input data.",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const params = productIdParamsSchema.parse(request.params);
      console.log("\n\nPARAMS:", request.params);
      console.log("REQUEST PARAMS:", request.params);
      console.log("REQUEST BODY:", request.body, "\n\n");
      const body = createSKUSchema.parse(request.body);

      const sku = await createSKU.execute({
        productId: params.productId,
        sku: body.sku,
        name: body.name,
      });

      return reply.status(201).send(sku);
    },
  );

  app.get(
    "/api/v1/products/:productId/skus",
    {
      schema: {
        tags: ["SKUs"],
        summary: "List SKUs for a product",
        description:
          "Retrieves a list of SKUs associated with the specified product.",
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
            description: "List of SKUs for the specified product",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                sku: { type: "string" },
                name: { type: "string" },
                productId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const params = productIdParamsSchema.parse(request.params);

      const skus = await listSKU.execute(params.productId);

      return reply.status(200).send(skus);
    },
  );
}
