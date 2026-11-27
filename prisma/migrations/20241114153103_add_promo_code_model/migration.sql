-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "promoCodeId" TEXT,
ADD COLUMN     "purchasePrice" DECIMAL(6,2);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "discountPercent" DECIMAL(6,2),
    "discountUSD" DECIMAL(6,2),
    "priceTierId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "usageLimit" INTEGER,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_priceTierId_fkey" FOREIGN KEY ("priceTierId") REFERENCES "PriceTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
