import type { SKURepository } from "../domain/repositories/SKURepository.js";
import type { SKU } from "../domain/entities/SKU.js";

export interface CreateSKUInput {
  productId: string;
  sku: string;
  name: string;
}

export class CreateSKU {
  constructor(private readonly skuRepository: SKURepository) {}

  async execute(input: CreateSKUInput): Promise<SKU> {
    const { productId, sku, name } = input;

    // Check if the SKU already exists for the given product
    const exists = await this.skuRepository.exists(productId, sku);
    if (exists) {
      throw new Error(
        `SKU "${sku}" already exists for product "${productId}".`,
      );
    }

    return this.skuRepository.create({ productId, sku, name });
  }
}
