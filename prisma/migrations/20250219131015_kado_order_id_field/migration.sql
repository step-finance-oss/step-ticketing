/*
  Warnings:

  - A unique constraint covering the columns `[kadoOrderId]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "kadoOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_kadoOrderId_key" ON "Purchase"("kadoOrderId");
