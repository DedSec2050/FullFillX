export class InventoryNotFoundError extends Error {
  constructor() {
    super("Inventory not found");
    this.name = "InventoryNotFoundError";
  }
}

export class InventoryAlreadyExistsError extends Error {
  constructor() {
    super("Inventory already exists for this warehouse and SKU");
    this.name = "InventoryAlreadyExistsError";
  }
}

export class InsufficientStockError extends Error {
  constructor() {
    super("Insufficient available stock");
    this.name = "InsufficientStockError";
  }
}

export class InsufficientReservedStockError extends Error {
  constructor() {
    super("Insufficient reserved stock");
    this.name = "InsufficientReservedStockError";
  }
}
