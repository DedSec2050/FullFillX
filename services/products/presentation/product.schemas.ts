import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(255),
});

export const productIdParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateProductRequest = z.infer<typeof createProductSchema>;
