-- CreateTable
CREATE TABLE "PriceOption" (
    "id" TEXT NOT NULL,
    "priceTierId" TEXT NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(6,2) NOT NULL,
    "label" TEXT,

    CONSTRAINT "PriceOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PriceOption" ADD CONSTRAINT "PriceOption_priceTierId_fkey" FOREIGN KEY ("priceTierId") REFERENCES "PriceTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
