import type { PrismaClient } from "@prisma/client";

import type { Order } from "../domain/entities/Order.js";

import {
  InsufficientInventoryError,
  InvalidOrderStatusTransitionError,
  OrderNotFoundError,
} from "../application/errors.js";

export class PrismaOrderFulfillmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async fulfill(tenantId: string, orderId: string): Promise<Order> {
    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          tenantId,
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new OrderNotFoundError();
      }

      if (order.status !== "ALLOCATED") {
        throw new InvalidOrderStatusTransitionError(order.status, "FULFILLED");
      }

      for (const item of order.items) {
        const inventories = await tx.inventory.findMany({
          where: {
            skuId: item.skuId,
            status: "ACTIVE",
            reserved: {
              gte: item.quantity,
            },
          },
          orderBy: {
            reserved: "desc",
          },
        });

        let fulfilled = false;

        for (const inventory of inventories) {
          const updated = await tx.inventory.updateMany({
            where: {
              id: inventory.id,
              reserved: {
                gte: item.quantity,
              },
            },
            data: {
              reserved: {
                decrement: item.quantity,
              },
            },
          });

          if (updated.count === 1) {
            fulfilled = true;
            break;
          }
        }

        if (!fulfilled) {
          throw new InsufficientInventoryError(item.skuId, item.quantity);
        }
      }

      return tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "FULFILLED",
        },
        include: {
          items: true,
        },
      });
    });

    return this.toDomain(result);
  }

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
}
