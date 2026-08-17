import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  createProductSchema,
  productIdParamsSchema,
} from "./product.schemas.js";
import { CreateProduct } from "../application/create-product.js";
import { GetProduct } from "../application/get-product.js";
import { ListProducts } from "../application/list-products.js";
import { PrismaProductRepository } from "../infrastructure/prisma-product-repository.js";
import { prisma } from "../../../apps/api/src/plugins/prisma.js";

export async function productRoutes(app: FastifyInstance) {
  const respository = new PrismaProductRepository(prisma);

  const createProductUseCase = new CreateProduct(respository);
  const getProductUseCase = new GetProduct(respository);
  const listProductsUseCase = new ListProducts(respository);

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
              maxLength: 100,
              description: "Product name",
            },
          },
        },
        response: {
          201: {
            description: "Product created successfully",
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
              tenantId: { type: "string", format: "uuid" },
            },
          },
          400: {
            description:
              "Bad request, e.g., missing tenant ID or invalid input",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const body = createProductSchema.parse(request.body);

      /*
       * TEMPORARY:
       * Will replace this with the
       * authenticated user's tenant later.
       */
      const tenantId = request.headers["x-tenant-id"];
      if (typeof tenantId !== "string") {
        return reply
          .status(400)
          .send({ error: "Tenant ID header is required" });
      }
      if (!tenantId) {
        return reply
          .status(400)
          .send({ error: "Tenant ID header is required" });
      }

      const product = await createProductUseCase.execute({
        tenantId,
        name: body.name,
      });

      return reply.status(201).send(product);
    },
  );

  /*
   * GET PRODUCT
   */

  app.get(
    "/api/v1/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Get a product by ID",
        description: "Retrieves a product by its ID for the specified tenant.",

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
          required: ["id"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Product UUID",
            },
          },
        },
        response: {
          200: {
            description: "Product retrieved successfully",
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
              tenantId: { type: "string", format: "uuid" },
            },
          },
          400: {
            description:
              "Bad request, e.g., missing tenant ID or invalid input",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          404: {
            description: "Product not found",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const params = productIdParamsSchema.parse(request.params);

      const tenantId = request.headers["x-tenant-id"];
      if (typeof tenantId !== "string") {
        return reply
          .status(400)
          .send({ error: "Tenant ID header is required" });
      }
      if (!tenantId) {
        return reply
          .status(400)
          .send({ error: "Tenant ID header is required" });
      }
      const product = await getProductUseCase.execute(tenantId, params.id);

      if (!product) {
        return reply.status(404).send({ error: "Product not found" });
      }
      return reply.status(200).send(product);
    },
  );

  /*
   * LIST PRODUCTS
   */
  app.get("/api/v1/products", async (request, reply) => {
    const tenantId = request.headers["x-tenant-id"];
    if (typeof tenantId !== "string") {
      return reply.status(400).send({ error: "Tenant ID header is required" });
    }
    if (!tenantId) {
      return reply.status(400).send({ error: "Tenant ID header is required" });
    }
    const products = await listProductsUseCase.execute(tenantId);

    return reply.status(200).send(products);
  });
}
