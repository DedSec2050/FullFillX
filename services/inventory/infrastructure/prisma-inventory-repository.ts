import type { PrismaClient } from "@prisma/client";

import type { Inventory } from "../domain/entities/Inventory.js";

import type {
  CreateInventoryData,
  InventoryRepository,
} from "../domain/repositories/InventoryRepository.js";
import {
  InsufficientReservedStockError,
  InventoryNotFoundError,
} from "../application/errors.js";

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
  async addStock(
    warehouseId: string,
    inventoryId: string,
    quantity: number,
  ): Promise<Inventory> {
    const updated = await this.prisma.inventory.updateMany({
      where: {
        id: inventoryId,
        warehouseId,
      },
      data: {
        available: {
          increment: quantity,
        },
      },
    });

    if (updated.count === 0) {
      throw new Error("Inventory not found");
    }

    const inventory = await this.prisma.inventory.findFirst({
      where: {
        id: inventoryId,
        warehouseId,
      },
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    return inventory as Inventory;
  }
  async reserveStock(
    warehouseId: string,
    inventoryId: string,
    quantity: number,
  ): Promise<Inventory> {
    const result = await this.prisma.inventory.updateMany({
      where: {
        id: inventoryId,
        warehouseId,
        available: {
          gte: quantity,
        },
      },

      data: {
        available: {
          decrement: quantity,
        },

        reserved: {
          increment: quantity,
        },
      },
    });

    if (result.count === 0) {
      const inventory = await this.prisma.inventory.findFirst({
        where: {
          id: inventoryId,
          warehouseId,
        },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      throw new Error("Insufficient available stock");
    }

    const inventory = await this.prisma.inventory.findFirst({
      where: {
        id: inventoryId,
        warehouseId,
      },
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    return inventory as Inventory;
  }

  async releaseReservation(
    warehouseId: string,
    inventoryId: string,
    quantity: number,
  ): Promise<Inventory> {
    const result = await this.prisma.inventory.updateMany({
      where: {
        id: inventoryId,
        warehouseId,
        reserved: {
          gte: quantity,
        },
      },

      data: {
        available: {
          increment: quantity,
        },

        reserved: {
          decrement: quantity,
        },
      },
    });

    if (result.count === 0) {
      const inventory = await this.prisma.inventory.findFirst({
        where: {
          id: inventoryId,
          warehouseId,
        },
      });

      if (!inventory) {
        throw new InventoryNotFoundError();
      }

      throw new InsufficientReservedStockError();
    }

    const inventory = await this.prisma.inventory.findFirst({
      where: {
        id: inventoryId,
        warehouseId,
      },
    });

    if (!inventory) {
      throw new InventoryNotFoundError();
    }

    return inventory as Inventory;
  }

  async fulfillReservation(
    warehouseId: string,
    inventoryId: string,
    quantity: number,
  ): Promise<Inventory> {
    const result = await this.prisma.inventory.updateMany({
      where: {
        id: inventoryId,
        warehouseId,
        reserved: {
          gte: quantity,
        },
      },

      data: {
        reserved: {
          decrement: quantity,
        },
      },
    });

    if (result.count === 0) {
      const inventory = await this.prisma.inventory.findFirst({
        where: {
          id: inventoryId,
          warehouseId,
        },
      });

      if (!inventory) {
        throw new InventoryNotFoundError();
      }

      throw new InsufficientReservedStockError();
    }

    const inventory = await this.prisma.inventory.findFirst({
      where: {
        id: inventoryId,
        warehouseId,
      },
    });

    if (!inventory) {
      throw new InventoryNotFoundError();
    }

    return inventory as Inventory;
  }
}
