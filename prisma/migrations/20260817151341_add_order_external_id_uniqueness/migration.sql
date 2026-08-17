/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,externalId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Order_externalId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Order_tenantId_externalId_key" ON "Order"("tenantId", "externalId");
