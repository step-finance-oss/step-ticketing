/*
  Warnings:

  - A unique constraint covering the columns `[purchaseId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ticket_purchaseId_key" ON "Ticket"("purchaseId");
