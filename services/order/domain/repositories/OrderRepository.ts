import type { Order } from "../entities/Order.js";

export interface CreateOrderItemData {
  skuId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderData {
  tenantId: string;
  storeId: string;
  externalId: string;
  items: CreateOrderItemData[];
}

export interface OrderRepository {
  create(data: CreateOrderData): Promise<Order>;

  findById(tenantId: string, orderId: string): Promise<Order | null>;

  findMany(tenantId: string): Promise<Order[]>;
}
