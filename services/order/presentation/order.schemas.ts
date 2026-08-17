import { z } from "zod";

export const createOrderSchema = z.object({
  storeId: z.uuid(),

  externalId: z.string().trim().min(1).max(255),

  items: z
    .array(
      z.object({
        skuId: z.uuid(),

        quantity: z.number().int().positive(),

        unitPrice: z.number().nonnegative(),
      }),
    )
    .min(1),
});

export const orderIdParamsSchema = z.object({
  orderId: z.uuid(),
});

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;
