import { PrismaClient } from "@prisma/client";
import type { Order } from "../domain/entities/Order.js";
import {
  InsufficientInventoryError,
  InvalidOrderStatusTransitionError,
  OrderNotFoundError,
} from "../application/errors.js";

export class PrismaOrderAllocationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async allocate(tenantId: string, orderId: string): Promise<Order> {
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

      if (order.status !== "CONFIRMED") {
        throw new InvalidOrderStatusTransitionError(order.status, "ALLOCATED");
      }

      /*
       * Reserve every OrderItem inside the same
       * database transaction.
       *
       * If any item fails, throwing an error causes
       * PostgreSQL to rollback every previous reservation.
       */
      for (const item of order.items) {
        const inventories = await tx.inventory.findMany({
          where: {
            skuId: item.skuId,
            status: "ACTIVE",
            available: {
              gte: item.quantity,
            },
          },
          orderBy: {
            available: "desc",
          },
        });

        let reserved = false;

        for (const inventory of inventories) {
          const updated = await tx.inventory.updateMany({
            where: {
              id: inventory.id,
              available: {
                gte: item.quantity,
              },
            },
            data: {
              available: {
                decrement: item.quantity,
              },
              reserved: {
                increment: item.quantity,
              },
            },
          });

          if (updated.count === 1) {
            reserved = true;
            break;
          }
        }

        if (!reserved) {
          throw new InsufficientInventoryError(item.skuId, item.quantity);
        }
      }

      const allocatedOrder = await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "ALLOCATED",
        },
        include: {
          items: true,
        },
      });

      return allocatedOrder;
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
