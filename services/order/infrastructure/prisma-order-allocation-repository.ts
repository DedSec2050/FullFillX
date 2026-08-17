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
       * Allocate every OrderItem inside the same
       * database transaction.
       *
       * A single OrderItem may now be allocated
       * across multiple inventory records / warehouses.
       *
       * If any item cannot be completely allocated,
       * throwing an error rolls back the entire transaction.
       */
      for (const item of order.items) {
        const inventories = await tx.inventory.findMany({
          where: {
            skuId: item.skuId,
            status: "ACTIVE",
            available: {
              gt: 0,
            },
          },
          orderBy: {
            available: "desc",
          },
        });

        let remaining = item.quantity;

        for (const inventory of inventories) {
          if (remaining <= 0) {
            break;
          }

          /*
           * Allocate as much as possible from this
           * inventory record.
           */
          const allocationQuantity = Math.min(inventory.available, remaining);

          if (allocationQuantity <= 0) {
            continue;
          }

          /*
           * Atomic conditional update.
           *
           * The WHERE condition protects us against
           * concurrent allocation requests.
           */
          const updated = await tx.inventory.updateMany({
            where: {
              id: inventory.id,
              available: {
                gte: allocationQuantity,
              },
            },
            data: {
              available: {
                decrement: allocationQuantity,
              },
              reserved: {
                increment: allocationQuantity,
              },
            },
          });

          /*
           * Another transaction may have consumed
           * this inventory between findMany() and
           * updateMany().
           *
           * If that happens, try the next inventory row.
           */
          if (updated.count !== 1) {
            continue;
          }

          /*
           * One OrderItem can now have multiple
           * Reservation records.
           */
          await tx.reservation.create({
            data: {
              orderItemId: item.id,
              inventoryId: inventory.id,
              quantity: allocationQuantity,
            },
          });

          remaining -= allocationQuantity;
        }

        /*
         * We were unable to completely allocate this
         * OrderItem.
         *
         * Throwing here causes the entire transaction
         * to rollback:
         *
         * - inventory changes
         * - reservations
         * - previous OrderItems
         */
        if (remaining > 0) {
          throw new InsufficientInventoryError(item.skuId, item.quantity);
        }
      }

      /*
       * Only mark the order ALLOCATED after every
       * OrderItem has been completely allocated.
       */
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
