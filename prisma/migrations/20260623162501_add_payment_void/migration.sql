-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "voidReason" TEXT,
ADD COLUMN     "voided" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "voidedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Payment_loanAccountId_voided_idx" ON "Payment"("loanAccountId", "voided");

-- CreateIndex
CREATE INDEX "Payment_voided_paymentDate_idx" ON "Payment"("voided", "paymentDate");
