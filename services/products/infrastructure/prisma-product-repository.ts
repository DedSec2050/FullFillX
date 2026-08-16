import { PrismaClient } from "@prisma/client";
import type { Product } from "../domain/entities/Product.js";
import type {
  CreateProductData,
  ProductRepository,
} from "../domain/repositories/ProductRepository.js";

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(product: Product): Promise<Product> {
    const createdProduct = await this.prisma.product.create({
      data: {
        tenantId: product.tenantId,
        name: product.name,
      },
    });

    return createdProduct as Product;
  }

  async findById(tenantId: string, productId: string): Promise<Product | null> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        tenantId: tenantId,
      },
    });

    return product as Product | null;
  }

  async findMany(tenantId: string): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        tenantId: tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return products as Product[];
  }
}
