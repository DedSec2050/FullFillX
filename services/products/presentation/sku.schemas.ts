import { z } from "zod";

export const createSKUSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
});

export const productIdParamsSchema = z.object({
  productId: z.uuid(),
});

export const skuParamsSchema = z.object({
  skuId: z.uuid(),
  productId: z.uuid(),
});
