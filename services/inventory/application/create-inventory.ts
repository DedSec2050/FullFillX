import type { Inventory } from "../domain/entities/Inventory.js";

import type { InventoryRepository } from "../domain/repositories/InventoryRepository.js";

import type {
  WarehouseLookupRepository,
  SKULookupRepository,
} from "../domain/repositories/InventoryDependencies.js";

import { InventoryAlreadyExistsError } from "./errors.js";

export interface CreateInventoryInput {
  warehouseId: string;
  skuId: string;
  available?: number;
}

export class CreateInventory {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly warehouseRepository: WarehouseLookupRepository,
    private readonly skuRepository: SKULookupRepository,
  ) {}

  async execute(input: CreateInventoryInput): Promise<Inventory> {
    const warehouseExists = await this.warehouseRepository.exists(
      input.warehouseId,
    );

    if (!warehouseExists) {
      throw new Error("Warehouse not found");
    }

    const skuExists = await this.skuRepository.exists(input.skuId);

    if (!skuExists) {
      throw new Error("SKU not found");
    }

    const existingInventory =
      await this.inventoryRepository.findByWarehouseAndSku(
        input.warehouseId,
        input.skuId,
      );

    if (existingInventory) {
      throw new InventoryAlreadyExistsError();
    }

    return this.inventoryRepository.create({
      warehouseId: input.warehouseId,
      skuId: input.skuId,
      available: input.available ?? 0,
    });
  }
}
