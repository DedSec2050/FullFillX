import type { PrismaClient } from "@prisma/client";

import type { SKULookupRepository } from "../domain/repositories/OrderDependencies.js";

export class PrismaSKULookupRepository implements SKULookupRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async belongsToTenant(tenantId: string, skuId: string): Promise<boolean> {
    const sku = await this.prisma.sKU.findFirst({
      where: {
        id: skuId,

        product: {
          tenantId,
        },
      },

      select: {
        id: true,
      },
    });

    return sku !== null;
  }
}
