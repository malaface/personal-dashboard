import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "./utils"

/**
 * RLS (Row Level Security) equivalent patterns using Prisma
 * All queries automatically filter by userId to ensure data isolation
 */

// Example: Get user's workouts with RLS-like filtering
export async function getUserWorkouts(options?: {
  startDate?: Date
  endDate?: Date
  limit?: number
}) {
  const user = await requireAuth()

  return await prisma.workout.findMany({
    where: {
      userId: user.id, // ← RLS equivalent: always filter by userId
      ...(options?.startDate && {
        date: {
          gte: options.startDate,
          ...(options?.endDate && { lte: options.endDate })
        }
      })
    },
    include: {
      exercises: true
    },
    orderBy: {
      date: 'desc'
    },
    take: options?.limit
  })
}

// Example: Get user's transactions with RLS-like filtering
export async function getUserTransactions(options?: {
  startDate?: Date
  endDate?: Date
  category?: string
  type?: 'income' | 'expense'
}) {
  const user = await requireAuth()

  return await prisma.transaction.findMany({
    where: {
      userId: user.id, // ← RLS equivalent
      ...(options?.category && { category: options.category }),
      ...(options?.type && { type: options.type }),
      ...(options?.startDate && {
        date: {
          gte: options.startDate,
          ...(options?.endDate && { lte: options.endDate })
        }
      })
    },
    orderBy: {
      date: 'desc'
    }
  })
}

// Example: Get single workout with ownership verification
export async function getUserWorkout(workoutId: string) {
  const user = await requireAuth()

  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      userId: user.id // ← Ownership verification
    },
    include: {
      exercises: {
        include: {
          progress: true
        }
      }
    }
  })

  if (!workout) {
    throw new Error("Workout not found or access denied")
  }

  return workout
}

/**
 * Template for creating secure queries:
 *
 * 1. Always call requireAuth() first
 * 2. Always add userId to where clause
 * 3. For updates/deletes, verify userId matches
 *
 * Example:
 *
 * export async function getUserData() {
 *   const user = await requireAuth()
 *
 *   return await prisma.model.findMany({
 *     where: { userId: user.id } // ← Always include this
 *   })
 * }
 */
