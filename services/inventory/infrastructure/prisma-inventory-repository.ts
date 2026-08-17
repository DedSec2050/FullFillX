import type { PrismaClient } from "@prisma/client";

import type { Inventory } from "../domain/entities/Inventory.js";

import type {
  CreateInventoryData,
  InventoryRepository,
} from "../domain/repositories/InventoryRepository.js";

export class PrismaInventoryRepository implements InventoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateInventoryData): Promise<Inventory> {
    const inventory = await this.prisma.inventory.create({
      data: {
        warehouseId: data.warehouseId,
        skuId: data.skuId,
        available: data.available ?? 0,
        reserved: 0,
      },
    });

    return inventory as Inventory;
  }

  async findById(
    warehouseId: string,
    inventoryId: string,
  ): Promise<Inventory | null> {
    const inventory = await this.prisma.inventory.findFirst({
      where: {
        id: inventoryId,
        warehouseId,
      },
    });

    return inventory as Inventory | null;
  }

  async findMany(warehouseId: string): Promise<Inventory[]> {
    const inventory = await this.prisma.inventory.findMany({
      where: {
        warehouseId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return inventory as Inventory[];
  }

  async findByWarehouseAndSku(
    warehouseId: string,
    skuId: string,
  ): Promise<Inventory | null> {
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        warehouseId_skuId: {
          warehouseId,
          skuId,
        },
      },
    });

    return inventory as Inventory | null;
  }
}
