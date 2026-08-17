import type { PrismaClient } from "@prisma/client";

import type { Warehouse } from "../domain/entities/warehouse.js";

import type {
  CreateWarehouseData,
  WarehouseRepository,
} from "../domain/repositories/warehouse-repository.js";

export class PrismaWarehouseRepository implements WarehouseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(warehouseData: CreateWarehouseData): Promise<Warehouse> {
    const createdWarehouse = await this.prisma.warehouse.create({
      data: {
        tenantId: warehouseData.tenantId,
        name: warehouseData.name,
        city: warehouseData.city,
        country: warehouseData.country,
      },
    });

    return createdWarehouse as Warehouse;
  }

  async findById(
    tenantId: string,
    warehouseId: string,
  ): Promise<Warehouse | null> {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        id: warehouseId,
        tenantId: tenantId,
      },
    });

    return warehouse as Warehouse | null;
  }

  async findMany(tenantId: string): Promise<Warehouse[]> {
    const warehouses = await this.prisma.warehouse.findMany({
      where: {
        tenantId: tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return warehouses as Warehouse[];
  }
}
