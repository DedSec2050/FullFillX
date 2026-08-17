import type { Inventory } from "../entities/Inventory.js";

export interface CreateInventoryData {
  warehouseId: string;
  skuId: string;
  available?: number;
  reserved?: number;
}

export interface InventoryRepository {
  create(data: CreateInventoryData): Promise<Inventory>;

  findById(warehouseId: string, inventoryId: string): Promise<Inventory | null>;

  findMany(warehouseId: string): Promise<Inventory[]>;

  findByWarehouseAndSku(
    warehouseId: string,
    skuId: string,
  ): Promise<Inventory | null>;
}
