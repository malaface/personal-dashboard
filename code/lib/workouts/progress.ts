/**
 * Workout Progress - Personal Records tracking and calculations
 */

import { prisma } from "@/lib/db/prisma"

export interface PersonalRecord {
  // Weight PR (heaviest weight used)
  maxWeight: {
    value: number | null
    date: Date | null
    workoutId: string | null
    isCurrentPR: boolean
  }
  // Volume PR (highest total volume = sets * reps * weight)
  maxVolume: {
    value: number
    date: Date | null
    workoutId: string | null
    isCurrentPR: boolean
  }
  // Reps PR (most reps in a single set at any weight)
  maxReps: {
    value: number
    date: Date | null
    workoutId: string | null
    isCurrentPR: boolean
  }
}

export interface ProgressComparison {
  currentVolume: number
  lastVolume: number
  volumeChange: number
  volumeChangePercent: number
  currentWeight: number | null
  lastWeight: number | null
  weightChange: number | null
  isNewPR: {
    weight: boolean
    volume: boolean
  }
}

/**
 * Get Personal Records for a specific exercise type
 */
export async function getPersonalRecords(
  userId: string,
  exerciseTypeId: string,
  currentExerciseId?: string
): Promise<PersonalRecord> {
  // Get all exercises of this type for the user
  const exercises = await prisma.exercise.findMany({
    where: {
      exerciseTypeId,
      workout: { userId },
    },
    include: {
      workout: {
        select: {
          id: true,
          date: true,
        },
      },
    },
  })

  // Calculate PRs
  let maxWeight: PersonalRecord["maxWeight"] = {
    value: null,
    date: null,
    workoutId: null,
    isCurrentPR: false,
  }

  let maxVolume: PersonalRecord["maxVolume"] = {
    value: 0,
    date: null,
    workoutId: null,
    isCurrentPR: false,
  }

  let maxReps: PersonalRecord["maxReps"] = {
    value: 0,
    date: null,
    workoutId: null,
    isCurrentPR: false,
  }

  for (const exercise of exercises) {
    const weight = exercise.weight
    const volume = exercise.sets * exercise.reps * (weight || 0)
    const reps = exercise.reps

    // Check weight PR
    if (weight !== null && (maxWeight.value === null || weight > maxWeight.value)) {
      maxWeight = {
        value: weight,
        date: exercise.workout.date,
        workoutId: exercise.workout.id,
        isCurrentPR: exercise.id === currentExerciseId,
      }
    }

    // Check volume PR
    if (volume > maxVolume.value) {
      maxVolume = {
        value: volume,
        date: exercise.workout.date,
        workoutId: exercise.workout.id,
        isCurrentPR: exercise.id === currentExerciseId,
      }
    }

    // Check reps PR
    if (reps > maxReps.value) {
      maxReps = {
        value: reps,
        date: exercise.workout.date,
        workoutId: exercise.workout.id,
        isCurrentPR: exercise.id === currentExerciseId,
      }
    }
  }

  return {
    maxWeight,
    maxVolume,
    maxReps,
  }
}

/**
 * Compare current performance with last performance
 */
export function comparePerformance(
  current: { sets: number; reps: number; weight: number | null },
  last: { sets: number; reps: number; weight: number | null },
  pr: PersonalRecord
): ProgressComparison {
  const currentVolume = current.sets * current.reps * (current.weight || 0)
  const lastVolume = last.sets * last.reps * (last.weight || 0)
  const volumeChange = currentVolume - lastVolume
  const volumeChangePercent = lastVolume > 0 ? (volumeChange / lastVolume) * 100 : 0

  const weightChange =
    current.weight !== null && last.weight !== null
      ? current.weight - last.weight
      : null

  // Check if current is a new PR
  const isNewWeightPR =
    current.weight !== null &&
    (pr.maxWeight.value === null || current.weight > pr.maxWeight.value)

  const isNewVolumePR = currentVolume > pr.maxVolume.value

  return {
    currentVolume,
    lastVolume,
    volumeChange,
    volumeChangePercent,
    currentWeight: current.weight,
    lastWeight: last.weight,
    weightChange,
    isNewPR: {
      weight: isNewWeightPR,
      volume: isNewVolumePR,
    },
  }
}

/**
 * Get progress trend for an exercise type (for charts)
 */
export async function getProgressTrend(
  userId: string,
  exerciseTypeId: string,
  limit: number = 20
): Promise<
  Array<{
    date: Date
    weight: number | null
    volume: number
    sets: number
    reps: number
  }>
> {
  const exercises = await prisma.exercise.findMany({
    where: {
      exerciseTypeId,
      workout: { userId },
    },
    orderBy: {
      workout: { date: "asc" },
    },
    take: limit,
    include: {
      workout: {
        select: {
          date: true,
        },
      },
    },
  })

  return exercises.map((e) => ({
    date: e.workout.date,
    weight: e.weight,
    volume: e.sets * e.reps * (e.weight || 0),
    sets: e.sets,
    reps: e.reps,
  }))
}

/**
 * Populate workout_progress table after creating/updating a workout
 * This is used to track historical progress
 */
export async function recordWorkoutProgress(
  workoutId: string,
  exercises: Array<{
    id: string
    sets: number
    reps: number
    weight: number | null
  }>,
  workoutDate: Date
): Promise<void> {
  // Delete existing progress records for this workout's exercises
  await prisma.workoutProgress.deleteMany({
    where: {
      exerciseId: {
        in: exercises.map((e) => e.id),
      },
    },
  })

  // Create new progress records
  await prisma.workoutProgress.createMany({
    data: exercises.map((e) => ({
      exerciseId: e.id,
      date: workoutDate,
      sets: e.sets,
      reps: e.reps,
      weight: e.weight || 0,
      volume: e.sets * e.reps * (e.weight || 0),
    })),
  })
}
