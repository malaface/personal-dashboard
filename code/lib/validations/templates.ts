import { z } from "zod"

// ============================================
// WORKOUT TEMPLATES
// ============================================

export const WorkoutTemplateExerciseSchema = z.object({
  exerciseTypeId: z.string().cuid("Invalid exercise type ID").optional().nullable(),
  muscleGroupId: z.string().cuid("Invalid muscle group ID").optional().nullable(),
  equipmentId: z.string().cuid("Invalid equipment ID").optional().nullable(),
  sets: z.number().int().min(1, "At least 1 set required").max(20),
  reps: z.number().int().min(1, "At least 1 rep required").max(100),
  weight: z.number().min(0).optional().nullable(),
  notes: z.string().max(200).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
})

export const WorkoutTemplateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name too long"),
  description: z.string().max(500).optional().nullable(),
  isPublic: z.boolean().default(false),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional().nullable(),
  tags: z.array(z.string()).default([]),
})

export const WorkoutTemplateWithExercisesSchema = WorkoutTemplateSchema.extend({
  exercises: z.array(WorkoutTemplateExerciseSchema).min(1, "At least one exercise required"),
})

export const UpdateWorkoutTemplateExerciseSchema = WorkoutTemplateExerciseSchema.extend({
  id: z.string().cuid().optional(), // Optional for updates
})

export const UpdateWorkoutTemplateSchema = WorkoutTemplateSchema.extend({
  exercises: z.array(UpdateWorkoutTemplateExerciseSchema).optional(),
})

// ============================================
// MEAL TEMPLATES
// ============================================

export const MealTemplateItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  quantity: z.number().min(0.1, "Quantity must be positive"),
  unit: z.string().min(1).max(20),
  calories: z.number().min(0).optional().nullable(),
  protein: z.number().min(0).optional().nullable(),
  carbs: z.number().min(0).optional().nullable(),
  fats: z.number().min(0).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
})

export const MealTemplateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name too long"),
  description: z.string().max(500).optional().nullable(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]).optional().nullable(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
})

export const MealTemplateWithItemsSchema = MealTemplateSchema.extend({
  foodItems: z.array(MealTemplateItemSchema).min(1, "At least one food item required"),
})

export const UpdateMealTemplateItemSchema = MealTemplateItemSchema.extend({
  id: z.string().cuid().optional(), // Optional for updates
})

export const UpdateMealTemplateSchema = MealTemplateSchema.extend({
  foodItems: z.array(UpdateMealTemplateItemSchema).optional(),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type WorkoutTemplateExerciseInput = z.infer<typeof WorkoutTemplateExerciseSchema>
export type WorkoutTemplateInput = z.infer<typeof WorkoutTemplateSchema>
export type WorkoutTemplateWithExercisesInput = z.infer<typeof WorkoutTemplateWithExercisesSchema>
export type UpdateWorkoutTemplateInput = z.infer<typeof UpdateWorkoutTemplateSchema>

export type MealTemplateItemInput = z.infer<typeof MealTemplateItemSchema>
export type MealTemplateInput = z.infer<typeof MealTemplateSchema>
export type MealTemplateWithItemsInput = z.infer<typeof MealTemplateWithItemsSchema>
export type UpdateMealTemplateInput = z.infer<typeof UpdateMealTemplateSchema>
