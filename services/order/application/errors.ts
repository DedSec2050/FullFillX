export class StoreNotFoundError extends Error {
  constructor() {
    super("Store not found");
    this.name = "StoreNotFoundError";
  }
}

export class SKUNotFoundError extends Error {
  constructor(public readonly skuId: string) {
    super(`SKU not found: ${skuId}`);
    this.name = "SKUNotFoundError";
  }
}

export class OrderNotFoundError extends Error {
  constructor() {
    super("Order not found");
    this.name = "OrderNotFoundError";
  }
}

export class OrderMustHaveItemsError extends Error {
  constructor() {
    super("Order must contain at least one item");
    this.name = "OrderMustHaveItemsError";
  }
}

export class InvalidOrderStatusTransitionError extends Error {
  constructor(
    public readonly currentStatus: string,
    public readonly targetStatus: string,
  ) {
    super(`Cannot transition order from ${currentStatus} to ${targetStatus}`);

    this.name = "InvalidOrderStatusTransitionError";
  }
}
