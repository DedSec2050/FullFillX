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
        /*
         * One OrderItem can have multiple reservations
         * because the item may have been allocated across
         * multiple warehouses.
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
          throw new InsufficientInventoryError(item.skuId, item.quantity);
        }

        let fulfilledQuantity = 0;

        for (const reservation of reservations) {
          /*
           * Consume the exact inventory that was reserved
           * during allocation.
           *
           * available is NOT changed here because it was
           * already decremented during allocation.
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
            throw new InsufficientInventoryError(
              item.skuId,
              reservation.quantity,
            );
          }

          fulfilledQuantity += reservation.quantity;

          /*
           * Reservation has been consumed.
           */
          await tx.reservation.delete({
            where: {
              id: reservation.id,
            },
          });
        }

        /*
         * Make sure every unit of the OrderItem was fulfilled.
         */
        if (fulfilledQuantity !== item.quantity) {
          throw new InsufficientInventoryError(item.skuId, item.quantity);
        }
      }

      /*
       * Only mark the order as FULFILLED after every
       * OrderItem and every reservation succeeds.
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
