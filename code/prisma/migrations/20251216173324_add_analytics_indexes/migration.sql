-- Migration: Add Analytics Indexes
-- Purpose: Optimize aggregation queries for analytics dashboard
-- Date: 2025-12-16

-- ============================================
-- Update Foreign Keys (Prisma auto-generated)
-- ============================================

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_category_id_fkey";

-- DropForeignKey
ALTER TABLE "family_members" DROP CONSTRAINT "family_members_relationship_type_id_fkey";

-- DropForeignKey
ALTER TABLE "reminders" DROP CONSTRAINT "reminders_category_id_fkey";

-- DropForeignKey
ALTER TABLE "time_logs" DROP CONSTRAINT "time_logs_activity_type_id_fkey";

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "category_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "family_members" ALTER COLUMN "relationship_type_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "reminders" ALTER COLUMN "category_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "time_logs" ALTER COLUMN "activity_type_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_relationship_type_id_fkey" FOREIGN KEY ("relationship_type_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_activity_type_id_fkey" FOREIGN KEY ("activity_type_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================
-- Analytics Indexes - Optimized for Aggregations
-- ============================================

-- Finance Analytics: Portfolio Allocation (by investment type)
CREATE INDEX IF NOT EXISTS "investments_userId_typeId_amount_idx" ON "investments"("userId", "typeId", "currentValue")
WHERE "currentValue" IS NOT NULL;

-- Finance Analytics: Transaction trends (by date range and category)
CREATE INDEX IF NOT EXISTS "transactions_userId_date_categoryId_idx" ON "transactions"("userId", "date" DESC, "categoryId")
WHERE "categoryId" IS NOT NULL;

-- Gym Analytics: Volume trends (by date and exercise type)
CREATE INDEX IF NOT EXISTS "workout_progress_exerciseId_date_volume_idx" ON "workout_progress"("exerciseId", "date" DESC, "volume");

-- Gym Analytics: Exercise frequency
CREATE INDEX IF NOT EXISTS "exercises_userId_exerciseTypeId_createdAt_idx" ON "exercises"("workoutId", "exercise_type_id", "createdAt" DESC)
WHERE "exercise_type_id" IS NOT NULL;

-- Nutrition Analytics: Macro trends (by date)
CREATE INDEX IF NOT EXISTS "food_items_mealId_calories_idx" ON "food_items"("mealId", "calories", "protein", "carbs", "fats")
WHERE "calories" IS NOT NULL;

-- Nutrition Analytics: Meal aggregations
CREATE INDEX IF NOT EXISTS "meals_userId_date_mealType_idx" ON "meals"("userId", "date" DESC, "mealType");

-- Family Analytics: Time logs aggregation (by family member and date)
CREATE INDEX IF NOT EXISTS "time_logs_userId_familyMemberId_date_idx" ON "time_logs"("userId", "familyMemberId", "date" DESC)
WHERE "familyMemberId" IS NOT NULL;

-- Family Analytics: Event frequency (by date and category)
CREATE INDEX IF NOT EXISTS "events_userId_date_categoryId_idx" ON "events"("userId", "date" DESC, "category_id")
WHERE "category_id" IS NOT NULL;

-- ============================================
-- NOTES:
-- - All indexes include userId for RLS filtering
-- - DESC order on date columns for recent-first queries
-- - Partial indexes with WHERE clauses to reduce index size
-- - Composite indexes ordered by query selectivity (most selective first)
-- ============================================
