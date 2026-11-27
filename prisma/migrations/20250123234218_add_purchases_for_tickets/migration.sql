-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('CREATED', 'IDLE', 'COMPLETED');

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "amount" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "status" "PurchaseStatus" NOT NULL DEFAULT 'CREATED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "purchaseId" TEXT;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
