import type { ProductRepository } from "../domain/repositories/ProductRepository.js";

export class GetProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(tenantId: string, productId: string) {
    return this.productRepository.findById(tenantId, productId);
  }
}
