import type { PrismaClient } from "@prisma/client";

import type { Order } from "../domain/entities/Order.js";

import {
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
        /*
         * Find the exact inventory reservation created
         * during allocation.
         */
        const reservation = await tx.reservation.findUnique({
          where: {
            orderItemId: item.id,
          },
        });

        if (!reservation) {
          throw new Error(`Reservation not found for order item ${item.id}`);
        }

        /*
         * Consume the reserved inventory.
         *
         * available does NOT change here because it was
         * already decreased during allocation.
         */
        const updated = await tx.inventory.updateMany({
          where: {
            id: reservation.inventoryId,
            reserved: {
              gte: reservation.quantity,
            },
          },
          data: {
            reserved: {
              decrement: reservation.quantity,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error(`Unable to consume reservation ${reservation.id}`);
        }

        /*
         * The reservation has now been consumed.
         */
        await tx.reservation.delete({
          where: {
            id: reservation.id,
          },
        });
      }

      /*
       * Only after every reservation has been consumed
       * do we mark the order as fulfilled.
       */
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
