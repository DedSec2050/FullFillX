import type { PrismaClient } from "@prisma/client";

import type { SKULookupRepository } from "../domain/repositories/InventoryDependencies.js";

export class PrismaSKULookupRepository implements SKULookupRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async exists(skuId: string): Promise<boolean> {
    const sku = await this.prisma.sKU.findUnique({
      where: {
        id: skuId,
      },
      select: {
        id: true,
      },
    });

    return sku !== null;
  }
}
