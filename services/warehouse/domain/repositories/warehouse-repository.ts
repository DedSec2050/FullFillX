import type { Warehouse } from "../entities/warehouse.js";

export interface CreateWarehouseData {
  tenantId: string;
  name: string;
  city: string;
  country: string;
}

export interface WarehouseRepository {
  create(warehouse: CreateWarehouseData): Promise<Warehouse>;

  findById(tenantId: string, warehouseId: string): Promise<Warehouse | null>;

  findMany(tenantId: string): Promise<Warehouse[]>;
}
