import type { InventoryRepository } from "../domain/repositories/InventoryRepository.js";

import { InventoryNotFoundError, InsufficientStockError } from "./errors.js";

export interface ReserveStockInput {
  warehouseId: string;
  inventoryId: string;
  quantity: number;
}

export class ReserveStock {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(input: ReserveStockInput) {
    const inventory = await this.inventoryRepository.findById(
      input.warehouseId,
      input.inventoryId,
    );

    if (!inventory) {
      throw new InventoryNotFoundError();
    }

    if (inventory.available < input.quantity) {
      throw new InsufficientStockError();
    }

    return this.inventoryRepository.reserveStock(
      input.warehouseId,
      input.inventoryId,
      input.quantity,
    );
  }
}
