import { Prisma, type PrismaClient } from "@prisma/client";

import type { Order } from "../domain/entities/Order.js";

import type {
  CreateOrderData,
  OrderRepository,
} from "../domain/repositories/OrderRepository.js";
import { OrderAlreadyExistsError } from "../application/errors.js";

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(order: any): Order {
    return {
      id: order.id,
      tenantId: order.tenantId,
      storeId: order.storeId,
      externalId: order.externalId,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      items: order.items.map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        skuId: item.skuId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        createdAt: item.createdAt,
      })),
    };
  }

  async create(data: CreateOrderData): Promise<Order> {
    try {
      const order = await this.prisma.order.create({
        data: {
          tenantId: data.tenantId,
          storeId: data.storeId,
          externalId: data.externalId,

          status: "PENDING",

          items: {
            create: data.items.map((item) => ({
              skuId: item.skuId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },

        include: {
          items: true,
        },
      });

      return this.toDomain(order);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new OrderAlreadyExistsError();
      }

      throw error;
    }
  }

  async findById(tenantId: string, orderId: string): Promise<Order | null> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId,
      },

      include: {
        items: true,
      },
    });

    return order ? this.toDomain(order) : null;
  }

  async findMany(tenantId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
      },

      include: {
        items: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return orders.map((order) => this.toDomain(order));
  }

  async updateStatus(
    tenantId: string,
    orderId: string,
    status: "CONFIRMED",
  ): Promise<Order> {
    const order = await this.prisma.order.update({
      where: {
        id: orderId,
        tenantId,
      },
      data: {
        status,
      },
      include: {
        items: true,
      },
    });

    return this.toDomain(order);
  }
}
