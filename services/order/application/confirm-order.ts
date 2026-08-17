import type { Order } from "../domain/entities/Order.js";
import {
  InvalidOrderStatusTransitionError,
  OrderNotFoundError,
} from "./errors.js";

export interface ConfirmOrderRepository {
  findById(tenantId: string, orderId: string): Promise<Order | null>;

  updateStatus(
    tenantId: string,
    orderId: string,
    status: "CONFIRMED",
  ): Promise<Order>;
}

export class ConfirmOrder {
  constructor(private readonly repository: ConfirmOrderRepository) {}

  async execute(tenantId: string, orderId: string): Promise<Order> {
    const order = await this.repository.findById(tenantId, orderId);

    if (!order) {
      throw new OrderNotFoundError();
    }

    if (order.status !== "PENDING") {
      throw new InvalidOrderStatusTransitionError(order.status, "CONFIRMED");
    }

    return this.repository.updateStatus(tenantId, orderId, "CONFIRMED");
  }
}
