import type { Product } from "../entities/Product.js";

export interface CreateProductData {
  tenantId: string;
  name: string;
}

export interface ProductRepository {
  create(product: CreateProductData): Promise<Product>;

  findById(tenantId: string, productId: string): Promise<Product | null>;

  findMany(tenantId: string): Promise<Product[]>;
}
