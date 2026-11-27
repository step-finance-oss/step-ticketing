-- AlterTable
ALTER TABLE "PriceTier" ADD COLUMN     "isMostPopular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "options" JSONB;
