-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "equipment_id" TEXT,
ADD COLUMN     "exercise_type_id" TEXT,
ADD COLUMN     "muscle_group_id" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "exercises_exercise_type_id_idx" ON "exercises"("exercise_type_id");

-- CreateIndex
CREATE INDEX "exercises_muscle_group_id_idx" ON "exercises"("muscle_group_id");

-- CreateIndex
CREATE INDEX "exercises_equipment_id_idx" ON "exercises"("equipment_id");

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_exercise_type_id_fkey" FOREIGN KEY ("exercise_type_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_muscle_group_id_fkey" FOREIGN KEY ("muscle_group_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
