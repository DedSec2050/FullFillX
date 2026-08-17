export interface WarehouseLookupRepository {
  exists(warehouseId: string): Promise<boolean>;
}

export interface SKULookupRepository {
  exists(skuId: string): Promise<boolean>;
}
