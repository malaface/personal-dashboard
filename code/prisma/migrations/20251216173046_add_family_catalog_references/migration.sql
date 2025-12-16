-- Migration: Add Family Module Catalog References
-- Purpose: Integrate Family CRM tables with Catalog System
-- Date: 2025-12-16

-- ============================================
-- 1. Add Foreign Key Columns
-- ============================================

-- FamilyMember: Add relationshipTypeId
ALTER TABLE "family_members"
ADD COLUMN "relationship_type_id" VARCHAR(30);

-- Event: Add categoryId
ALTER TABLE "events"
ADD COLUMN "category_id" VARCHAR(30);

-- Reminder: Add categoryId
ALTER TABLE "reminders"
ADD COLUMN "category_id" VARCHAR(30);

-- TimeLog: Add activityTypeId
ALTER TABLE "time_logs"
ADD COLUMN "activity_type_id" VARCHAR(30);

-- ============================================
-- 2. Create Foreign Key Constraints
-- ============================================

-- FamilyMember -> CatalogItem (relationship_type)
ALTER TABLE "family_members"
ADD CONSTRAINT "family_members_relationship_type_id_fkey"
FOREIGN KEY ("relationship_type_id")
REFERENCES "catalog_items"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Event -> CatalogItem (event_category)
ALTER TABLE "events"
ADD CONSTRAINT "events_category_id_fkey"
FOREIGN KEY ("category_id")
REFERENCES "catalog_items"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Reminder -> CatalogItem (reminder_category)
ALTER TABLE "reminders"
ADD CONSTRAINT "reminders_category_id_fkey"
FOREIGN KEY ("category_id")
REFERENCES "catalog_items"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- TimeLog -> CatalogItem (activity_type)
ALTER TABLE "time_logs"
ADD CONSTRAINT "time_logs_activity_type_id_fkey"
FOREIGN KEY ("activity_type_id")
REFERENCES "catalog_items"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- ============================================
-- 3. Create Indexes for Performance
-- ============================================

CREATE INDEX "family_members_relationship_type_id_idx" ON "family_members"("relationship_type_id");
CREATE INDEX "events_category_id_idx" ON "events"("category_id");
CREATE INDEX "reminders_category_id_idx" ON "reminders"("category_id");
CREATE INDEX "time_logs_activity_type_id_idx" ON "time_logs"("activity_type_id");

-- ============================================
-- NOTES:
-- - All foreign keys use RESTRICT to prevent accidental deletion
-- - Existing 'relationship' column in family_members kept for backward compatibility
-- - New columns are nullable to allow gradual migration
-- ============================================
