import type { WarehouseRepository } from "../domain/repositories/warehouse-repository.js";

export interface CreateWarehouseInput {
  tenantId: string;
  name: string;
  city: string;
  country: string;
}

export class CreateWarehouse {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  async execute(input: CreateWarehouseInput) {
    return this.warehouseRepository.create({
      tenantId: input.tenantId,
      name: input.name,
      city: input.city,
      country: input.country,
    });
  }
}
