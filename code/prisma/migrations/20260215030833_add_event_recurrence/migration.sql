-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('YEARLY', 'MONTHLY', 'WEEKLY');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurrenceType" "RecurrenceType";
