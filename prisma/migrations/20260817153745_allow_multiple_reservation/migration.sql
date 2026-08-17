/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Reservation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Reservation_orderItemId_key";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "updatedAt";

-- CreateIndex
CREATE INDEX "Reservation_orderItemId_idx" ON "Reservation"("orderItemId");
