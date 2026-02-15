-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('GYM', 'SWIMMING', 'RUNNING', 'CYCLING');

-- CreateEnum
CREATE TYPE "StrokeType" AS ENUM ('FREESTYLE', 'BACKSTROKE', 'BREASTSTROKE', 'BUTTERFLY', 'MIXED');

-- DropIndex
DROP INDEX "workouts_userId_date_idx";

-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "caloriesBurned" DOUBLE PRECISION,
ADD COLUMN     "type" "WorkoutType" NOT NULL DEFAULT 'GYM';

-- CreateTable
CREATE TABLE "cardio_sessions" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "distance" DOUBLE PRECISION,
    "distanceUnit" TEXT NOT NULL DEFAULT 'km',
    "pace" DOUBLE PRECISION,
    "avgSpeed" DOUBLE PRECISION,
    "maxSpeed" DOUBLE PRECISION,
    "elevationGain" DOUBLE PRECISION,
    "avgHeartRate" INTEGER,
    "laps" INTEGER,
    "poolSize" INTEGER,
    "strokeType" "StrokeType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cardio_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cardio_sessions_workoutId_key" ON "cardio_sessions"("workoutId");

-- CreateIndex
CREATE INDEX "cardio_sessions_workoutId_idx" ON "cardio_sessions"("workoutId");

-- CreateIndex
CREATE INDEX "workouts_userId_type_date_idx" ON "workouts"("userId", "type", "date");

-- AddForeignKey
ALTER TABLE "cardio_sessions" ADD CONSTRAINT "cardio_sessions_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
