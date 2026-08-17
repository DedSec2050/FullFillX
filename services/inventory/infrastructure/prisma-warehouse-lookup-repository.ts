import type { PrismaClient } from "@prisma/client";

import type { WarehouseLookupRepository } from "../domain/repositories/InventoryDependencies.js";

export class PrismaWarehouseLookupRepository implements WarehouseLookupRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async exists(warehouseId: string): Promise<boolean> {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: {
        id: warehouseId,
      },
      select: {
        id: true,
      },
    });

    return warehouse !== null;
  }
}
