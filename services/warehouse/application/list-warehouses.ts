import type { WarehouseRepository } from "../domain/repositories/warehouse-repository.js";

export class ListWarehouses {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  async execute(tenantId: string) {
    return this.warehouseRepository.findMany(tenantId);
  }
}
