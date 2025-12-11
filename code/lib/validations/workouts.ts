import { z } from "zod"

export const WorkoutSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name too long"),
  date: z.string().or(z.date()),
  duration: z.number().int().min(1).optional(),
  notes: z.string().max(500).optional(),
})

export const ExerciseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  sets: z.number().int().min(1, "At least 1 set required").max(20),
  reps: z.number().int().min(1, "At least 1 rep required").max(100),
  weight: z.number().min(0).optional(),
  notes: z.string().max(200).optional(),
})

export const WorkoutWithExercisesSchema = WorkoutSchema.extend({
  exercises: z.array(ExerciseSchema).min(1, "At least one exercise required"),
})

export type WorkoutInput = z.infer<typeof WorkoutSchema>
export type ExerciseInput = z.infer<typeof ExerciseSchema>
export type WorkoutWithExercisesInput = z.infer<typeof WorkoutWithExercisesSchema>
