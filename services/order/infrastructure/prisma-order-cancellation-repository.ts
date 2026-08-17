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
       * ALLOCATED requires releasing reservations.
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
       * Only ALLOCATED orders have reservations.
       */
      if (order.status === "ALLOCATED") {
        for (const item of order.items) {
          /*
           * One OrderItem can have multiple reservations.
           */
          const reservations = await tx.reservation.findMany({
            where: {
              orderItemId: item.id,
            },
            orderBy: {
              createdAt: "asc",
            },
          });

          if (reservations.length === 0) {
            throw new Error(`Reservation not found for order item ${item.id}`);
          }

          for (const reservation of reservations) {
            /*
             * Release the exact inventory record that
             * was reserved during allocation.
             *
             * available += reserved quantity
             * reserved  -= reserved quantity
             */
            const updated = await tx.inventory.updateMany({
              where: {
                id: reservation.inventoryId,
                reserved: {
                  gte: reservation.quantity,
                },
              },
              data: {
                available: {
                  increment: reservation.quantity,
                },
                reserved: {
                  decrement: reservation.quantity,
                },
              },
            });

            if (updated.count !== 1) {
              throw new Error(
                `Unable to release reservation ${reservation.id}`,
              );
            }

            /*
             * Reservation has now been released.
             */
            await tx.reservation.delete({
              where: {
                id: reservation.id,
              },
            });
          }
        }
      }

      /*
       * Only mark the order as CANCELLED after all
       * inventory operations have succeeded.
       */
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
