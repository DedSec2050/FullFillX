export interface StoreLookupRepository {
  findById(tenantId: string, storeId: string): Promise<boolean>;
}

export interface SKULookupRepository {
  belongsToTenant(tenantId: string, skuId: string): Promise<boolean>;
}
