import type { PrismaClient } from "@prisma/client";

import type { Order } from "../domain/entities/Order.js";

import {
  InvalidOrderStatusTransitionError,
  OrderNotFoundError,
} from "../application/errors.js";

export class PrismaOrderCancellationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async cancel(tenantId: string, orderId: string): Promise<Order> {
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

      /*
       * PENDING and CONFIRMED can be cancelled
       * without touching inventory.
       *
       * ALLOCATED requires inventory release.
       *
       * FULFILLED and CANCELLED cannot be cancelled.
       */
      if (
        order.status !== "PENDING" &&
        order.status !== "CONFIRMED" &&
        order.status !== "ALLOCATED"
      ) {
        throw new InvalidOrderStatusTransitionError(order.status, "CANCELLED");
      }

      /*
       * Only an allocated order has reserved inventory.
       */
      if (order.status === "ALLOCATED") {
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

          let released = false;

          for (const inventory of inventories) {
            const updated = await tx.inventory.updateMany({
              where: {
                id: inventory.id,
                reserved: {
                  gte: item.quantity,
                },
              },
              data: {
                available: {
                  increment: item.quantity,
                },
                reserved: {
                  decrement: item.quantity,
                },
              },
            });

            if (updated.count === 1) {
              released = true;
              break;
            }
          }

          if (!released) {
            throw new Error(
              `Unable to release inventory for SKU ${item.skuId}`,
            );
          }
        }
      }

      const cancelledOrder = await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "CANCELLED",
        },
        include: {
          items: true,
        },
      });

      return cancelledOrder;
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
