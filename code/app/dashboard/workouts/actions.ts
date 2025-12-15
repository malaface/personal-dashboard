"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { WorkoutWithExercisesSchema } from "@/lib/validations/workouts"
import { createAuditLog } from "@/lib/audit/logger"

export async function createWorkout(formData: FormData) {
  try {
    const user = await requireAuth()

    // Parse form data
    const rawData = {
      name: formData.get("name"),
      date: formData.get("date"),
      duration: formData.get("duration") ? parseInt(formData.get("duration") as string) : undefined,
      notes: formData.get("notes") || undefined,
      exercises: JSON.parse(formData.get("exercises") as string || "[]"),
    }

    // Validate
    const validatedData = WorkoutWithExercisesSchema.parse(rawData)

    // Create workout with exercises
    const workout = await prisma.workout.create({
      data: {
        userId: user.id, // ← RLS equivalent: always set userId
        name: validatedData.name,
        date: new Date(validatedData.date),
        duration: validatedData.duration,
        notes: validatedData.notes,
        exercises: {
          create: validatedData.exercises.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            notes: exercise.notes,
          })),
        },
      },
      include: { exercises: true },
    })

    // Log workout creation
    await createAuditLog({
      userId: user.id,
      action: "WORKOUT_CREATED",
      metadata: { workoutId: workout.id, workoutName: workout.name },
    })

    revalidatePath("/dashboard/workouts")

    return { success: true, workout }
  } catch (error: any) {
    console.error("Create workout error:", error)
    return {
      success: false,
      error: error.message || "Failed to create workout"
    }
  }
}

export async function deleteWorkout(workoutId: string) {
  try {
    const user = await requireAuth()

    // Verify ownership before deleting
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: user.id, // ← Authorization check
      },
    })

    if (!workout) {
      return { success: false, error: "Workout not found or access denied" }
    }

    // Capture workout name before deleting
    const workoutName = workout.name

    // Log before deleting
    await createAuditLog({
      userId: user.id,
      action: "WORKOUT_DELETED",
      metadata: { workoutId, workoutName },
    })

    // Delete workout (exercises will cascade delete)
    await prisma.workout.delete({
      where: { id: workoutId },
    })

    revalidatePath("/dashboard/workouts")

    return { success: true }
  } catch (error: any) {
    console.error("Delete workout error:", error)
    return { success: false, error: error.message || "Failed to delete workout" }
  }
}

export async function updateWorkout(workoutId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    // Verify ownership
    const existingWorkout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: user.id, // ← Authorization check
      },
    })

    if (!existingWorkout) {
      return { success: false, error: "Workout not found or access denied" }
    }

    // Parse and validate
    const rawData = {
      name: formData.get("name"),
      date: formData.get("date"),
      duration: formData.get("duration") ? parseInt(formData.get("duration") as string) : undefined,
      notes: formData.get("notes") || undefined,
      exercises: JSON.parse(formData.get("exercises") as string || "[]"),
    }

    const validatedData = WorkoutWithExercisesSchema.parse(rawData)

    // Update workout and replace exercises
    const workout = await prisma.$transaction(async (tx) => {
      // Delete old exercises
      await tx.exercise.deleteMany({
        where: { workoutId },
      })

      // Update workout with new exercises
      return tx.workout.update({
        where: { id: workoutId },
        data: {
          name: validatedData.name,
          date: new Date(validatedData.date),
          duration: validatedData.duration,
          notes: validatedData.notes,
          exercises: {
            create: validatedData.exercises.map((exercise) => ({
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              notes: exercise.notes,
            })),
          },
        },
        include: { exercises: true },
      })
    })

    // Log workout update
    await createAuditLog({
      userId: user.id,
      action: "WORKOUT_UPDATED",
      metadata: { workoutId, workoutName: validatedData.name },
    })

    revalidatePath("/dashboard/workouts")

    return { success: true, workout }
  } catch (error: any) {
    console.error("Update workout error:", error)
    return { success: false, error: error.message || "Failed to update workout" }
  }
}
