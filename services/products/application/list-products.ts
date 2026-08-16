import type { ProductRepository } from "../domain/repositories/ProductRepository.js";

export class ListProducts {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(tenantId: string) {
    return this.productRepository.findMany(tenantId);
  }
}
