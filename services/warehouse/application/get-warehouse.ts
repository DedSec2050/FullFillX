import type { WarehouseRepository } from "../domain/repositories/warehouse-repository.js";

export class GetWarehouse {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  async execute(tenantId: string, warehouseId: string) {
    return this.warehouseRepository.findById(tenantId, warehouseId);
  }
}
