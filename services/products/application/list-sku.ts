import type { SKURepository } from "../domain/repositories/SKURepository.js";

export class ListSKU {
  constructor(private readonly skuRepository: SKURepository) {}

  async execute(productId: string) {
    return this.skuRepository.findMany(productId);
  }
}
