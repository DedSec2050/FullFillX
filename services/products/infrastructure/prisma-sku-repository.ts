import type { PrismaClient } from "@prisma/client";

import type { SKU } from "../domain/entities/SKU.js";

import type {
  CreateSKUData,
  SKURepository,
} from "../domain/repositories/SKURepository.js";

export class PrismaSKURepository implements SKURepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(skuData: CreateSKUData): Promise<SKU> {
    const createdSKU = await this.prisma.sKU.create({
      data: {
        productId: skuData.productId,
        sku: skuData.sku,
        name: skuData.name,
      },
    });
    return createdSKU as SKU;
  }

  async findById(productId: string, skuId: string): Promise<SKU | null> {
    const sku = await this.prisma.sKU.findUnique({
      where: {
        id: skuId,
        productId: productId,
      },
    });
    return sku as SKU | null;
  }

  async findMany(productId: string): Promise<SKU[]> {
    const skus = await this.prisma.sKU.findMany({
      where: {
        productId: productId,
      },
    });
    return skus as SKU[];
  }

  async exists(productId: string, sku: string): Promise<boolean> {
    const existingSKU = await this.prisma.sKU.findFirst({
      where: {
        productId: productId,
        sku: sku,
      },
    });
    return existingSKU !== null;
  }
}
