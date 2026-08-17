import { z } from "zod";

export const createInventorySchema = z.object({
  skuId: z.uuid(),

  available: z.number().int().min(0).default(0),
});

export const warehouseIdParamsSchema = z.object({
  warehouseId: z.uuid(),
});

export const inventoryIdParamsSchema = z.object({
  warehouseId: z.uuid(),
  inventoryId: z.uuid(),
});

export type CreateInventoryRequest = z.infer<typeof createInventorySchema>;
