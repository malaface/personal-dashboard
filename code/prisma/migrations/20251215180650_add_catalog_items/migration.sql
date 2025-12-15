-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "categoryId" TEXT,
ALTER COLUMN "category" DROP NOT NULL;

-- AlterTable
ALTER TABLE "investments" ADD COLUMN     "typeId" TEXT,
ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "typeId" TEXT,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "category" DROP NOT NULL;

-- CreateTable
CREATE TABLE "catalog_items" (
    "id" TEXT NOT NULL,
    "catalogType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "catalog_items_catalogType_isSystem_userId_idx" ON "catalog_items"("catalogType", "isSystem", "userId");

-- CreateIndex
CREATE INDEX "catalog_items_parentId_idx" ON "catalog_items"("parentId");

-- CreateIndex
CREATE INDEX "catalog_items_userId_idx" ON "catalog_items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_items_catalogType_slug_userId_key" ON "catalog_items"("catalogType", "slug", "userId");

-- CreateIndex
CREATE INDEX "budgets_categoryId_idx" ON "budgets"("categoryId");

-- CreateIndex
CREATE INDEX "investments_typeId_idx" ON "investments"("typeId");

-- CreateIndex
CREATE INDEX "transactions_userId_categoryId_idx" ON "transactions"("userId", "categoryId");

-- CreateIndex
CREATE INDEX "transactions_typeId_idx" ON "transactions"("typeId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add CHECK constraints
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_level_check" CHECK (level >= 0 AND level <= 3);

ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_ownership_check" CHECK (
    ("isSystem" = true AND "userId" IS NULL) OR
    ("isSystem" = false AND "userId" IS NOT NULL)
);

-- Create function to validate max depth and auto-calculate level
CREATE OR REPLACE FUNCTION validate_catalog_item_depth()
RETURNS TRIGGER AS $$
DECLARE
    parent_level INTEGER;
BEGIN
    IF NEW."parentId" IS NOT NULL THEN
        SELECT level INTO parent_level FROM catalog_items WHERE id = NEW."parentId";

        IF parent_level IS NULL THEN
            RAISE EXCEPTION 'Parent catalog item not found';
        END IF;

        IF parent_level >= 3 THEN
            RAISE EXCEPTION 'Cannot create catalog item: maximum depth of 3 levels exceeded';
        END IF;

        NEW.level := parent_level + 1;
    ELSE
        NEW.level := 0;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for depth validation
CREATE TRIGGER catalog_item_depth_trigger
BEFORE INSERT OR UPDATE ON catalog_items
FOR EACH ROW
EXECUTE FUNCTION validate_catalog_item_depth();

-- Create function to prevent circular references
CREATE OR REPLACE FUNCTION prevent_catalog_circular_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."parentId" IS NOT NULL THEN
        -- Check if item is its own parent
        IF NEW.id = NEW."parentId" THEN
            RAISE EXCEPTION 'Catalog item cannot be its own parent';
        END IF;

        -- Check if parent_id creates a cycle using recursive CTE
        IF EXISTS (
            WITH RECURSIVE hierarchy AS (
                SELECT id, "parentId" FROM catalog_items WHERE id = NEW."parentId"
                UNION ALL
                SELECT c.id, c."parentId"
                FROM catalog_items c
                INNER JOIN hierarchy h ON c.id = h."parentId"
            )
            SELECT 1 FROM hierarchy WHERE id = NEW.id
        ) THEN
            RAISE EXCEPTION 'Circular reference detected in catalog hierarchy';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for circular reference prevention
CREATE TRIGGER prevent_circular_reference_trigger
BEFORE INSERT OR UPDATE ON catalog_items
FOR EACH ROW
EXECUTE FUNCTION prevent_catalog_circular_reference();
