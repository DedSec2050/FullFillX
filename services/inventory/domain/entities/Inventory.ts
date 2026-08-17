export type InventoryStatus = "ACTIVE" | "INACTIVE";

export interface Inventory {
  id: string;
  warehouseId: string;
  skuId: string;
  available: number;
  reserved: number;
  status: InventoryStatus;
  createdAt: Date;
  updatedAt: Date;
}
