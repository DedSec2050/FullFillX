import type { Order } from "../domain/entities/Order.js";
import type { OrderRepository } from "../domain/repositories/OrderRepository.js";

import {
  InvalidOrderStatusTransitionError,
  OrderNotFoundError,
} from "./errors.js";

export interface FulfillOrderRepository {
  fulfill(tenantId: string, orderId: string): Promise<Order>;
}

export class FulfillOrder {
  constructor(private readonly repository: FulfillOrderRepository) {}

  async execute(tenantId: string, orderId: string): Promise<Order> {
    return this.repository.fulfill(tenantId, orderId);
  }
}
