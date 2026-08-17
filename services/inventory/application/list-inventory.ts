import type { InventoryRepository } from "../domain/repositories/InventoryRepository.js";

export class ListInventory {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(warehouseId: string) {
    return this.inventoryRepository.findMany(warehouseId);
  }
}
