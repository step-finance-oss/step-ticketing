-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "priceOptionId" TEXT;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_priceOptionId_fkey" FOREIGN KEY ("priceOptionId") REFERENCES "PriceOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
