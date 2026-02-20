import { z } from "zod"

export const WorkoutSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name too long"),
  date: z.string().or(z.date()),
  duration: z.number().int().min(1).optional(),
  notes: z.string().max(500).optional(),
})

// Legacy Exercise Schema (for backward compatibility)
export const ExerciseSchemaLegacy = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  sets: z.number().int().min(1, "At least 1 set required").max(20),
  reps: z.number().int().min(1, "At least 1 rep required").max(100),
  weight: z.number().min(0).optional(),
  notes: z.string().max(200).optional(),
})

// Set Detail Schema (per-set tracking)
export const SetDetailSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(1),
  weight: z.number().min(0).nullable().optional(),
  completed: z.boolean(),
})

// NEW: Exercise Schema (using CatalogItems)
export const ExerciseSchema = z.object({
  exerciseTypeId: z.string().cuid("Invalid exercise type ID"),
  muscleGroupId: z.string().cuid("Invalid muscle group ID").optional().nullable(),
  equipmentId: z.string().cuid("Invalid equipment ID").optional().nullable(),
  sets: z.number().int().min(1, "At least 1 set required").max(20),
  reps: z.number().int().min(1, "At least 1 rep required").max(100),
  weight: z.number().min(0).optional().nullable(),
  weightUnit: z.enum(["kg", "lbs"]).default("kg"),
  notes: z.string().max(200).optional().nullable(),
  setDetails: z.array(SetDetailSchema).optional(),
})

export const WorkoutWithExercisesSchema = WorkoutSchema.extend({
  exercises: z.array(ExerciseSchema).min(1, "At least one exercise required"),
})

// ============================================
// CARDIO SCHEMAS
// ============================================

export const WorkoutTypeEnum = z.enum(["GYM", "SWIMMING", "RUNNING", "CYCLING"])
export const StrokeTypeEnum = z.enum(["FREESTYLE", "BACKSTROKE", "BREASTSTROKE", "BUTTERFLY", "MIXED"])

export const SwimmingSessionSchema = z.object({
  distance: z.number().min(0).optional().nullable(),
  distanceUnit: z.literal("m").default("m"),
  laps: z.number().int().min(1).optional().nullable(),
  poolSize: z.enum(["25", "50"]).optional().nullable(),
  strokeType: StrokeTypeEnum.optional().nullable(),
  avgHeartRate: z.number().int().min(30).max(250).optional().nullable(),
})

export const RunningSessionSchema = z.object({
  distance: z.number().min(0).optional().nullable(),
  distanceUnit: z.literal("km").default("km"),
  pace: z.number().min(0).optional().nullable(), // min/km
  elevationGain: z.number().min(0).optional().nullable(), // meters
  avgHeartRate: z.number().int().min(30).max(250).optional().nullable(),
})

export const CyclingSessionSchema = z.object({
  distance: z.number().min(0).optional().nullable(),
  distanceUnit: z.literal("km").default("km"),
  avgSpeed: z.number().min(0).optional().nullable(), // km/h
  maxSpeed: z.number().min(0).optional().nullable(), // km/h
  elevationGain: z.number().min(0).optional().nullable(), // meters
  avgHeartRate: z.number().int().min(30).max(250).optional().nullable(),
})

export const CardioSessionSchema = z.union([
  SwimmingSessionSchema,
  RunningSessionSchema,
  CyclingSessionSchema,
])

export const CardioWorkoutSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name too long"),
  type: WorkoutTypeEnum,
  date: z.string().or(z.date()),
  duration: z.number().int().min(1).optional(),
  caloriesBurned: z.number().min(0).optional().nullable(),
  notes: z.string().max(500).optional(),
  session: CardioSessionSchema,
})

// ============================================
// TYPES
// ============================================

export type WorkoutInput = z.infer<typeof WorkoutSchema>
export type SetDetailInput = z.infer<typeof SetDetailSchema>
export type ExerciseInput = z.infer<typeof ExerciseSchema>
export type ExerciseLegacyInput = z.infer<typeof ExerciseSchemaLegacy>
export type WorkoutWithExercisesInput = z.infer<typeof WorkoutWithExercisesSchema>
export type CardioWorkoutInput = z.infer<typeof CardioWorkoutSchema>
export type SwimmingSessionInput = z.infer<typeof SwimmingSessionSchema>
export type RunningSessionInput = z.infer<typeof RunningSessionSchema>
export type CyclingSessionInput = z.infer<typeof CyclingSessionSchema>
