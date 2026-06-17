-- DropIndex
DROP INDEX "Payment_orNumber_key";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "orNumber" DROP NOT NULL;
