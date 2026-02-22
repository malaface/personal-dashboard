"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { WorkoutWithExercisesSchema, CardioWorkoutSchema } from "@/lib/validations/workouts"
import { WorkoutType } from "@prisma/client"
import { createAuditLog } from "@/lib/audit/logger"
import { getCatalogItemById } from "@/lib/catalog/queries"

export async function createWorkout(formData: FormData) {
  try {
    const user = await requireAuth()

    const caloriesRaw = formData.get("caloriesBurned")
    const caloriesBurned = caloriesRaw ? parseFloat(caloriesRaw as string) : undefined

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

    // Validate catalog items exist for each exercise
    for (const exercise of validatedData.exercises) {
      if (exercise.exerciseTypeId) {
        const exerciseType = await getCatalogItemById(exercise.exerciseTypeId, user.id)
        if (!exerciseType) {
          return { success: false, error: `Invalid exercise type ID: ${exercise.exerciseTypeId}` }
        }
      }
      if (exercise.muscleGroupId) {
        const muscleGroup = await getCatalogItemById(exercise.muscleGroupId, user.id)
        if (!muscleGroup) {
          return { success: false, error: `Invalid muscle group ID: ${exercise.muscleGroupId}` }
        }
      }
      if (exercise.equipmentId) {
        const equipment = await getCatalogItemById(exercise.equipmentId, user.id)
        if (!equipment) {
          return { success: false, error: `Invalid equipment ID: ${exercise.equipmentId}` }
        }
      }
    }

    // Create workout with exercises
    const workout = await prisma.workout.create({
      data: {
        userId: user.id, // ← RLS equivalent: always set userId
        name: validatedData.name,
        type: "GYM",
        date: new Date(validatedData.date),
        duration: validatedData.duration,
        caloriesBurned: caloriesBurned || undefined,
        notes: validatedData.notes,
        exercises: {
          create: validatedData.exercises.map((exercise: any) => ({
            exerciseTypeId: exercise.exerciseTypeId,
            muscleGroupId: exercise.muscleGroupId,
            equipmentId: exercise.equipmentId,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            weightUnit: exercise.weightUnit || "kg",
            notes: exercise.notes,
            ...(exercise.setDetails?.length > 0 && {
              exerciseSets: {
                create: exercise.setDetails.map((sd: any) => ({
                  setNumber: sd.setNumber,
                  reps: sd.reps,
                  weight: sd.weight ?? null,
                  completed: sd.completed ?? true,
                })),
              },
            }),
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exerciseType: true,
            muscleGroup: true,
            equipment: true,
            exerciseSets: true,
          }
        }
      },
    })

    // Log workout creation
    await createAuditLog({
      userId: user.id,
      action: "WORKOUT_CREATED",
      metadata: { workoutId: workout.id, workoutName: workout.name },
    })

    revalidatePath("/dashboard/workouts")

    return { success: true, workout }
  } catch (error: unknown) {
    console.error("Create workout error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create workout"
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
  } catch (error: unknown) {
    console.error("Delete workout error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete workout" }
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

    const caloriesRawUpdate = formData.get("caloriesBurned")
    const caloriesBurnedUpdate = caloriesRawUpdate ? parseFloat(caloriesRawUpdate as string) : undefined

    // Parse and validate
    const rawData = {
      name: formData.get("name"),
      date: formData.get("date"),
      duration: formData.get("duration") ? parseInt(formData.get("duration") as string) : undefined,
      notes: formData.get("notes") || undefined,
      exercises: JSON.parse(formData.get("exercises") as string || "[]"),
    }

    const validatedData = WorkoutWithExercisesSchema.parse(rawData)

    // Validate catalog items exist for each exercise
    for (const exercise of validatedData.exercises) {
      if (exercise.exerciseTypeId) {
        const exerciseType = await getCatalogItemById(exercise.exerciseTypeId, user.id)
        if (!exerciseType) {
          return { success: false, error: `Invalid exercise type ID: ${exercise.exerciseTypeId}` }
        }
      }
      if (exercise.muscleGroupId) {
        const muscleGroup = await getCatalogItemById(exercise.muscleGroupId, user.id)
        if (!muscleGroup) {
          return { success: false, error: `Invalid muscle group ID: ${exercise.muscleGroupId}` }
        }
      }
      if (exercise.equipmentId) {
        const equipment = await getCatalogItemById(exercise.equipmentId, user.id)
        if (!equipment) {
          return { success: false, error: `Invalid equipment ID: ${exercise.equipmentId}` }
        }
      }
    }

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
          caloriesBurned: caloriesBurnedUpdate || undefined,
          notes: validatedData.notes,
          exercises: {
            create: validatedData.exercises.map((exercise: any) => ({
              exerciseTypeId: exercise.exerciseTypeId,
              muscleGroupId: exercise.muscleGroupId,
              equipmentId: exercise.equipmentId,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              weightUnit: exercise.weightUnit || "kg",
              notes: exercise.notes,
              ...(exercise.setDetails?.length > 0 && {
                exerciseSets: {
                  create: exercise.setDetails.map((sd: any) => ({
                    setNumber: sd.setNumber,
                    reps: sd.reps,
                    weight: sd.weight ?? null,
                    completed: sd.completed ?? true,
                  })),
                },
              }),
            })),
          },
        },
        include: {
          exercises: {
            include: {
              exerciseType: true,
              muscleGroup: true,
              equipment: true,
              exerciseSets: true,
            }
          }
        },
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
  } catch (error: unknown) {
    console.error("Update workout error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update workout" }
  }
}

// ============================================
// CARDIO WORKOUT ACTIONS
// ============================================

export async function createCardioWorkout(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      name: formData.get("name"),
      type: formData.get("type"),
      date: formData.get("date"),
      duration: formData.get("duration") ? parseInt(formData.get("duration") as string) : undefined,
      caloriesBurned: formData.get("caloriesBurned") ? parseFloat(formData.get("caloriesBurned") as string) : undefined,
      notes: formData.get("notes") || undefined,
      session: JSON.parse(formData.get("session") as string || "{}"),
    }

    const validatedData = CardioWorkoutSchema.parse(rawData)

    const workout = await prisma.$transaction(async (tx) => {
      const newWorkout = await tx.workout.create({
        data: {
          userId: user.id,
          name: validatedData.name,
          type: validatedData.type as WorkoutType,
          date: new Date(validatedData.date),
          duration: validatedData.duration,
          caloriesBurned: validatedData.caloriesBurned,
          notes: validatedData.notes,
        },
      })

      await tx.cardioSession.create({
        data: {
          workoutId: newWorkout.id,
          distance: validatedData.session.distance,
          distanceUnit: "distanceUnit" in validatedData.session ? validatedData.session.distanceUnit : "km",
          pace: "pace" in validatedData.session ? validatedData.session.pace : undefined,
          avgSpeed: "avgSpeed" in validatedData.session ? validatedData.session.avgSpeed : undefined,
          maxSpeed: "maxSpeed" in validatedData.session ? validatedData.session.maxSpeed : undefined,
          elevationGain: "elevationGain" in validatedData.session ? validatedData.session.elevationGain : undefined,
          avgHeartRate: "avgHeartRate" in validatedData.session ? validatedData.session.avgHeartRate : undefined,
          laps: "laps" in validatedData.session ? validatedData.session.laps : undefined,
          poolSize: "poolSize" in validatedData.session ? (validatedData.session.poolSize ? parseInt(validatedData.session.poolSize) : undefined) : undefined,
          strokeType: "strokeType" in validatedData.session ? validatedData.session.strokeType : undefined,
        },
      })

      return tx.workout.findUnique({
        where: { id: newWorkout.id },
        include: { cardioSession: true },
      })
    })

    await createAuditLog({
      userId: user.id,
      action: "WORKOUT_CREATED",
      metadata: { workoutId: workout?.id, workoutName: validatedData.name, type: validatedData.type },
    })

    revalidatePath("/dashboard/workouts")

    return { success: true, workout }
  } catch (error: any) {
    console.error("Create cardio workout error:", error)
    return { success: false, error: error.message || "Failed to create cardio workout" }
  }
}

export async function updateCardioWorkout(workoutId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    const existingWorkout = await prisma.workout.findFirst({
      where: { id: workoutId, userId: user.id },
    })

    if (!existingWorkout) {
      return { success: false, error: "Workout not found or access denied" }
    }

    const rawData = {
      name: formData.get("name"),
      type: formData.get("type"),
      date: formData.get("date"),
      duration: formData.get("duration") ? parseInt(formData.get("duration") as string) : undefined,
      caloriesBurned: formData.get("caloriesBurned") ? parseFloat(formData.get("caloriesBurned") as string) : undefined,
      notes: formData.get("notes") || undefined,
      session: JSON.parse(formData.get("session") as string || "{}"),
    }

    const validatedData = CardioWorkoutSchema.parse(rawData)

    const workout = await prisma.$transaction(async (tx) => {
      await tx.workout.update({
        where: { id: workoutId },
        data: {
          name: validatedData.name,
          type: validatedData.type as WorkoutType,
          date: new Date(validatedData.date),
          duration: validatedData.duration,
          caloriesBurned: validatedData.caloriesBurned,
          notes: validatedData.notes,
        },
      })

      await tx.cardioSession.upsert({
        where: { workoutId },
        create: {
          workoutId,
          distance: validatedData.session.distance,
          distanceUnit: "distanceUnit" in validatedData.session ? validatedData.session.distanceUnit : "km",
          pace: "pace" in validatedData.session ? validatedData.session.pace : undefined,
          avgSpeed: "avgSpeed" in validatedData.session ? validatedData.session.avgSpeed : undefined,
          maxSpeed: "maxSpeed" in validatedData.session ? validatedData.session.maxSpeed : undefined,
          elevationGain: "elevationGain" in validatedData.session ? validatedData.session.elevationGain : undefined,
          avgHeartRate: "avgHeartRate" in validatedData.session ? validatedData.session.avgHeartRate : undefined,
          laps: "laps" in validatedData.session ? validatedData.session.laps : undefined,
          poolSize: "poolSize" in validatedData.session ? (validatedData.session.poolSize ? parseInt(validatedData.session.poolSize) : undefined) : undefined,
          strokeType: "strokeType" in validatedData.session ? validatedData.session.strokeType : undefined,
        },
        update: {
          distance: validatedData.session.distance,
          distanceUnit: "distanceUnit" in validatedData.session ? validatedData.session.distanceUnit : "km",
          pace: "pace" in validatedData.session ? validatedData.session.pace : null,
          avgSpeed: "avgSpeed" in validatedData.session ? validatedData.session.avgSpeed : null,
          maxSpeed: "maxSpeed" in validatedData.session ? validatedData.session.maxSpeed : null,
          elevationGain: "elevationGain" in validatedData.session ? validatedData.session.elevationGain : null,
          avgHeartRate: "avgHeartRate" in validatedData.session ? validatedData.session.avgHeartRate : null,
          laps: "laps" in validatedData.session ? validatedData.session.laps : null,
          poolSize: "poolSize" in validatedData.session ? (validatedData.session.poolSize ? parseInt(validatedData.session.poolSize) : null) : null,
          strokeType: "strokeType" in validatedData.session ? validatedData.session.strokeType : null,
        },
      })

      return tx.workout.findUnique({
        where: { id: workoutId },
        include: { cardioSession: true },
      })
    })

    await createAuditLog({
      userId: user.id,
      action: "WORKOUT_UPDATED",
      metadata: { workoutId, workoutName: validatedData.name, type: validatedData.type },
    })

    revalidatePath("/dashboard/workouts")

    return { success: true, workout }
  } catch (error: any) {
    console.error("Update cardio workout error:", error)
    return { success: false, error: error.message || "Failed to update cardio workout" }
  }
}
