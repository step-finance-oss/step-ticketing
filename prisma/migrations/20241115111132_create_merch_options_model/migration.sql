-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "selectedMerchOptions" JSONB;

-- CreateTable
CREATE TABLE "MerchOption" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "options" JSONB NOT NULL,

    CONSTRAINT "MerchOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MerchOption" ADD CONSTRAINT "MerchOption_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Migrate data


INSERT INTO "MerchOption" ("id", "label", "eventId", "options")
SELECT gen_random_uuid(), 'Shirt', id, '{"size": ["S", "M", "L", "XL", "XXL"]}' FROM "Event";
