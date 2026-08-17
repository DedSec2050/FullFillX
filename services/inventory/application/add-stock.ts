import type { InventoryRepository } from "../domain/repositories/InventoryRepository.js";

import { InventoryNotFoundError } from "./errors.js";

export interface AddStockInput {
  warehouseId: string;
  inventoryId: string;
  quantity: number;
}

export class AddStock {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(input: AddStockInput) {
    const inventory = await this.inventoryRepository.findById(
      input.warehouseId,
      input.inventoryId,
    );

    if (!inventory) {
      throw new InventoryNotFoundError();
    }

    return this.inventoryRepository.addStock(
      input.warehouseId,
      input.inventoryId,
      input.quantity,
    );
  }
}
