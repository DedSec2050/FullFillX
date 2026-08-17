import type { Order } from "../domain/entities/Order.js";

export interface CancelOrderRepository {
  cancel(tenantId: string, orderId: string): Promise<Order>;
}

export class CancelOrder {
  constructor(private readonly repository: CancelOrderRepository) {}

  async execute(tenantId: string, orderId: string): Promise<Order> {
    return this.repository.cancel(tenantId, orderId);
  }
}
