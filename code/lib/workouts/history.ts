/**
 * Workout History - Functions to get exercise performance history
 */

import { prisma } from "@/lib/db/prisma"
import { differenceInDays } from "date-fns"

export interface LastPerformance {
  found: boolean
  lastWorkout?: {
    date: Date
    daysAgo: number
    sets: number
    reps: number
    weight: number | null
    volume: number
    workoutName: string
    workoutId: string
    exerciseId: string
    muscleGroupId: string | null
    equipmentId: string | null
  }
}

export interface ExerciseHistoryEntry {
  date: Date
  sets: number
  reps: number
  weight: number | null
  volume: number
  workoutId: string
  workoutName: string
}

/**
 * Get the last time a user performed a specific exercise type
 */
export async function getLastExercisePerformance(
  userId: string,
  exerciseTypeId: string
): Promise<LastPerformance> {
  const lastExercise = await prisma.exercise.findFirst({
    where: {
      exerciseTypeId,
      workout: { userId },
    },
    orderBy: {
      workout: { date: "desc" },
    },
    include: {
      workout: {
        select: {
          id: true,
          date: true,
          name: true,
        },
      },
    },
  })

  if (!lastExercise) {
    return { found: false }
  }

  const daysAgo = differenceInDays(new Date(), lastExercise.workout.date)
  const weight = lastExercise.weight
  const volume = lastExercise.sets * lastExercise.reps * (weight || 0)

  return {
    found: true,
    lastWorkout: {
      date: lastExercise.workout.date,
      daysAgo,
      sets: lastExercise.sets,
      reps: lastExercise.reps,
      weight,
      volume,
      workoutName: lastExercise.workout.name,
      workoutId: lastExercise.workout.id,
      exerciseId: lastExercise.id,
      muscleGroupId: lastExercise.muscleGroupId,
      equipmentId: lastExercise.equipmentId,
    },
  }
}

/**
 * Get exercise history for a specific exercise type
 */
export async function getExerciseHistory(
  userId: string,
  exerciseTypeId: string,
  limit: number = 10
): Promise<ExerciseHistoryEntry[]> {
  const exercises = await prisma.exercise.findMany({
    where: {
      exerciseTypeId,
      workout: { userId },
    },
    orderBy: {
      workout: { date: "desc" },
    },
    take: limit,
    include: {
      workout: {
        select: {
          id: true,
          date: true,
          name: true,
        },
      },
    },
  })

  return exercises.map((e) => ({
    date: e.workout.date,
    sets: e.sets,
    reps: e.reps,
    weight: e.weight,
    volume: e.sets * e.reps * (e.weight || 0),
    workoutId: e.workout.id,
    workoutName: e.workout.name,
  }))
}

/**
 * Get all distinct exercise types that a user has performed
 */
export async function getUserExerciseTypes(userId: string): Promise<
  Array<{
    id: string
    name: string
    lastPerformed: Date
    totalWorkouts: number
  }>
> {
  // Get distinct exercise types with their catalog item info
  const exercises = await prisma.exercise.findMany({
    where: {
      workout: { userId },
      exerciseTypeId: { not: null },
    },
    select: {
      exerciseTypeId: true,
      exerciseType: {
        select: {
          id: true,
          name: true,
        },
      },
      workout: {
        select: {
          date: true,
        },
      },
    },
    orderBy: {
      workout: { date: "desc" },
    },
  })

  // Group by exercise type
  const typeMap = new Map<
    string,
    {
      id: string
      name: string
      lastPerformed: Date
      totalWorkouts: number
    }
  >()

  for (const exercise of exercises) {
    if (!exercise.exerciseTypeId || !exercise.exerciseType) continue

    const existing = typeMap.get(exercise.exerciseTypeId)
    if (existing) {
      existing.totalWorkouts++
    } else {
      typeMap.set(exercise.exerciseTypeId, {
        id: exercise.exerciseTypeId,
        name: exercise.exerciseType.name,
        lastPerformed: exercise.workout.date,
        totalWorkouts: 1,
      })
    }
  }

  return Array.from(typeMap.values())
}
