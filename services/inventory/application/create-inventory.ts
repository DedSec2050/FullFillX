import type { Inventory } from "../domain/entities/Inventory.js";
import type {
  InventoryRepository,
  CreateInventoryData,
} from "../domain/repositories/InventoryRepository.js";

export class CreateInventory {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(input: CreateInventoryData): Promise<Inventory> {
    return this.inventoryRepository.create(input);
  }
}
