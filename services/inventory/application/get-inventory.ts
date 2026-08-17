import type { InventoryRepository } from "../domain/repositories/InventoryRepository.js";

export class GetInventory {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(warehouseId: string, inventoryId: string) {
    return this.inventoryRepository.findById(warehouseId, inventoryId);
  }
}
