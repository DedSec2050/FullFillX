import type { OrderItem } from "./OrderItem.js";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ALLOCATED"
  | "FULFILLED"
  | "CANCELLED";

export interface Order {
  id: string;
  tenantId: string;
  storeId: string;
  externalId: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}
