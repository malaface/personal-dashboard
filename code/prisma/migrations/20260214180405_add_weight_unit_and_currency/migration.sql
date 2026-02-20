-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "weight_unit" TEXT NOT NULL DEFAULT 'kg';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'MXN';
