-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'GUEST');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'GUEST';

UPDATE "User" SET "role" = 'GUEST' WHERE "password" IS NULL;
UPDATE "User" SET "role" = 'ADMIN' WHERE "password" IS NOT NULL;
