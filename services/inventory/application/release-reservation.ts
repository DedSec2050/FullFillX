import type { InventoryRepository } from "../domain/repositories/InventoryRepository.js";

import {
  InventoryNotFoundError,
  InsufficientReservedStockError,
} from "./errors.js";

export interface ReleaseReservationInput {
  warehouseId: string;
  inventoryId: string;
  quantity: number;
}

export class ReleaseReservation {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(input: ReleaseReservationInput) {
    const inventory = await this.inventoryRepository.findById(
      input.warehouseId,
      input.inventoryId,
    );

    if (!inventory) {
      throw new InventoryNotFoundError();
    }

    if (inventory.reserved < input.quantity) {
      throw new InsufficientReservedStockError();
    }

    return this.inventoryRepository.releaseReservation(
      input.warehouseId,
      input.inventoryId,
      input.quantity,
    );
  }
}
