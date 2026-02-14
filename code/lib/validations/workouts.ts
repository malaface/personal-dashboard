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
})

export const WorkoutWithExercisesSchema = WorkoutSchema.extend({
  exercises: z.array(ExerciseSchema).min(1, "At least one exercise required"),
})

export type WorkoutInput = z.infer<typeof WorkoutSchema>
export type ExerciseInput = z.infer<typeof ExerciseSchema>
export type ExerciseLegacyInput = z.infer<typeof ExerciseSchemaLegacy>
export type WorkoutWithExercisesInput = z.infer<typeof WorkoutWithExercisesSchema>
