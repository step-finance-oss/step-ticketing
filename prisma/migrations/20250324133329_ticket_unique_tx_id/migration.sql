/*
  Warnings:

  - A unique constraint covering the columns `[txId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ticket_txId_key" ON "Ticket"("txId");
