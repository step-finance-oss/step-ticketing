-- AlterTable
ALTER TABLE "Purchase" ALTER COLUMN "status" SET DEFAULT 'PENDING';
UPDATE "Purchase" SET "status" = 'PENDING' WHERE "status" = 'CREATED';
