import type { Order } from "../domain/entities/Order.js";

import type {
  CreateOrderData,
  OrderRepository,
} from "../domain/repositories/OrderRepository.js";

import type {
  StoreLookupRepository,
  SKULookupRepository,
} from "../domain/repositories/OrderDependencies.js";

import {
  OrderMustHaveItemsError,
  StoreNotFoundError,
  SKUNotFoundError,
} from "./errors.js";

export class CreateOrder {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly storeRepository: StoreLookupRepository,
    private readonly skuRepository: SKULookupRepository,
  ) {}

  async execute(input: CreateOrderData): Promise<Order> {
    if (input.items.length === 0) {
      throw new OrderMustHaveItemsError();
    }

    const storeExists = await this.storeRepository.findById(
      input.tenantId,
      input.storeId,
    );

    if (!storeExists) {
      throw new StoreNotFoundError();
    }

    for (const item of input.items) {
      const skuBelongsToTenant = await this.skuRepository.belongsToTenant(
        input.tenantId,
        item.skuId,
      );

      if (!skuBelongsToTenant) {
        throw new SKUNotFoundError(item.skuId);
      }
    }

    return this.orderRepository.create(input);
  }
}
