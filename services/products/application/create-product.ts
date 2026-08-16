import type { ProductRepository } from "../domain/repositories/ProductRepository.js";

export interface createProductInput {
  tenantId: string;
  name: string;
}

export class CreateProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: createProductInput) {
    return this.productRepository.create({
      tenantId: input.tenantId,
      name: input.name,
    });
  }
}
