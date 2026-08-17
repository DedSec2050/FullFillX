import type { OrderRepository } from "../domain/repositories/OrderRepository.js";

import { OrderNotFoundError } from "./errors.js";

export class GetOrder {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(tenantId: string, orderId: string) {
    const order = await this.orderRepository.findById(tenantId, orderId);

    if (!order) {
      throw new OrderNotFoundError();
    }

    return order;
  }
}
