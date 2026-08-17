import { z } from "zod";

export const createWarehouseSchema = z.object({
  name: z.string().trim().min(1).max(255),

  city: z.string().trim().min(1).max(150),

  country: z.string().trim().min(1).max(100),
});

export const warehouseIdParamsSchema = z.object({
  warehouseId: z.uuid(),
});

export type CreateWarehouseRequest = z.infer<typeof createWarehouseSchema>;
