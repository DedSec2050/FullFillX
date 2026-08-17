import type { SKU } from "../entities/SKU.js";

export interface CreateSKUData {
  productId: string;
  sku: string;
  name: string;
}

export interface SKURepository {
  create(sku: CreateSKUData): Promise<SKU>;

  findById(productId: string, skuId: string): Promise<SKU | null>;

  findMany(productId: string): Promise<SKU[]>;

  exists(productId: string, sku: string): Promise<boolean>;
}
