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

  app.post("/api/v1/products/:productId/skus", async (request, reply) => {
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
  });

  app.get("/api/v1/products/:productId/skus", async (request, reply) => {
    const params = productIdParamsSchema.parse(request.params);

    const skus = await listSKU.execute(params.productId);

    return reply.status(200).send(skus);
  });
}
