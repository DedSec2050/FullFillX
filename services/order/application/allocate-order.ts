import type { Order } from "../domain/entities/Order.js";
import {
  InsufficientInventoryError,
  InvalidOrderStatusTransitionError,
  OrderNotFoundError,
} from "./errors.js";

export interface AllocateOrderRepository {
  allocate(tenantId: string, orderId: string): Promise<Order>;
}

export class AllocateOrder {
  constructor(private readonly repository: AllocateOrderRepository) {}

  async execute(tenantId: string, orderId: string): Promise<Order> {
    try {
      return await this.repository.allocate(tenantId, orderId);
    } catch (error) {
      throw error;
    }
  }
}
