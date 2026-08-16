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

  app.post("/api/v1/products", async (request, reply) => {
    const body = createProductSchema.parse(request.body);

    /*
     * TEMPORARY:
     * Will replace this with the
     * authenticated user's tenant later.
     */
    const tenantId = request.headers["x-tenant-id"];
    if (typeof tenantId !== "string") {
      return reply.status(400).send({ error: "Tenant ID header is required" });
    }
    if (!tenantId) {
      return reply.status(400).send({ error: "Tenant ID header is required" });
    }

    const product = await createProductUseCase.execute({
      tenantId,
      name: body.name,
    });

    return reply.status(201).send(product);
  });

  /*
   * GET PRODUCT
   */

  app.get("/api/v1/products/:id", async (request, reply) => {
    const params = productIdParamsSchema.parse(request.params);

    const tenantId = request.headers["x-tenant-id"];
    if (typeof tenantId !== "string") {
      return reply.status(400).send({ error: "Tenant ID header is required" });
    }
    if (!tenantId) {
      return reply.status(400).send({ error: "Tenant ID header is required" });
    }
    const product = await getProductUseCase.execute(tenantId, params.id);

    if (!product) {
      return reply.status(404).send({ error: "Product not found" });
    }
    return reply.status(200).send(product);
  });

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
