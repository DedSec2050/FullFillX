import type { PrismaClient } from "@prisma/client";

import type { StoreLookupRepository } from "../domain/repositories/OrderDependencies.js";

export class PrismaStoreLookupRepository implements StoreLookupRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(tenantId: string, storeId: string): Promise<boolean> {
    const store = await this.prisma.store.findFirst({
      where: {
        id: storeId,
        tenantId,
      },
      select: {
        id: true,
      },
    });

    return store !== null;
  }
}
