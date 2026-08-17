import type { OrderRepository } from "../domain/repositories/OrderRepository.js";

export class ListOrders {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(tenantId: string) {
    return this.orderRepository.findMany(tenantId);
  }
}
