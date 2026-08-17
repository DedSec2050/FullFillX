export interface OrderItem {
  id: string;
  orderId: string;
  skuId: string;
  quantity: number;
  unitPrice: number;
  createdAt: Date;
}
