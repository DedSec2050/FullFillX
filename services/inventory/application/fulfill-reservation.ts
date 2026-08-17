import type { InventoryRepository } from "../domain/repositories/InventoryRepository.js";

import {
  InventoryNotFoundError,
  InsufficientReservedStockError,
} from "./errors.js";

export interface FulfillReservationInput {
  warehouseId: string;
  inventoryId: string;
  quantity: number;
}

export class FulfillReservation {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(input: FulfillReservationInput) {
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

    return this.inventoryRepository.fulfillReservation(
      input.warehouseId,
      input.inventoryId,
      input.quantity,
    );
  }
}
