/**
 * Backup Schemas - Zod validation schemas for export/import
 */

import { z } from "zod"
import { ALL_MODULES, BACKUP_VERSION } from "./types"

// Helper for ISO date strings
const isoDateString = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: "Invalid ISO date string" }
)

// Backup metadata schema
export const BackupMetaSchema = z.object({
  version: z.string(),
  exportDate: isoDateString,
  userId: z.string(),
  userEmail: z.string().email(),
  modules: z.array(z.enum(ALL_MODULES)),
})

// Profile schema
export const ExportedProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  bio: z.string().nullable().optional(),
  birthday: isoDateString.nullable().optional(),
  phone: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
})

// Workout Progress schema
export const ExportedWorkoutProgressSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  date: isoDateString,
  sets: z.number().int(),
  reps: z.number().int(),
  weight: z.number(),
  volume: z.number(),
  createdAt: isoDateString,
})

// Exercise schema
export const ExportedExerciseSchema = z.object({
  id: z.string(),
  workoutId: z.string(),
  name: z.string().nullable().optional(),
  exerciseTypeId: z.string().nullable().optional(),
  muscleGroupId: z.string().nullable().optional(),
  equipmentId: z.string().nullable().optional(),
  sets: z.number().int(),
  reps: z.number().int(),
  weight: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
  progress: z.array(ExportedWorkoutProgressSchema).optional(),
})

// Workout schema
export const ExportedWorkoutSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  date: isoDateString,
  duration: z.number().int().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
  exercises: z.array(ExportedExerciseSchema),
})

// Workout Template Exercise schema
export const ExportedWorkoutTemplateExerciseSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  exerciseTypeId: z.string().nullable().optional(),
  muscleGroupId: z.string().nullable().optional(),
  equipmentId: z.string().nullable().optional(),
  sets: z.number().int(),
  reps: z.number().int(),
  weight: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  sortOrder: z.number().int(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
})

// Workout Template schema
export const ExportedWorkoutTemplateSchema = z.object({
  id: z.string(),
  userId: z.string().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  isPublic: z.boolean(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).nullable().optional(),
  tags: z.array(z.string()),
  createdAt: isoDateString,
  updatedAt: isoDateString,
  exercises: z.array(ExportedWorkoutTemplateExerciseSchema),
})

// Transaction schema
export const ExportedTransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  typeId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  amount: z.number(),
  description: z.string().nullable().optional(),
  date: isoDateString,
  createdAt: isoDateString,
  updatedAt: isoDateString,
})

// Investment schema
export const ExportedInvestmentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: z.string().nullable().optional(),
  typeId: z.string().nullable().optional(),
  amount: z.number(),
  currentValue: z.number().nullable().optional(),
  purchaseDate: isoDateString,
  notes: z.string().nullable().optional(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
})

// Budget schema
export const ExportedBudgetSchema = z.object({
  id: z.string(),
  userId: z.string(),
  category: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  limit: z.number(),
  month: isoDateString,
  spent: z.number(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
})

// Food Item schema
export const ExportedFoodItemSchema = z.object({
  id: z.string(),
  mealId: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  calories: z.number().nullable().optional(),
  protein: z.number().nullable().optional(),
  carbs: z.number().nullable().optional(),
  fats: z.number().nullable().optional(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
})

// Meal schema
export const ExportedMealSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  date: isoDateString,
  notes: z.string().nullable().optional(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
  foodItems: z.array(ExportedFoodItemSchema),
})

// Nutrition Goal schema
export const ExportedNutritionGoalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fats: z.number(),
  date: isoDateString,
  createdAt: isoDateString,
  updatedAt: isoDateString,
})

// Meal Template Item schema
export const ExportedMealTemplateItemSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  calories: z.number().nullable().optional(),
  protein: z.number().nullable().optional(),
  carbs: z.number().nullable().optional(),
  fats: z.number().nullable().optional(),
  sortOrder: z.number().int(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
})

// Meal Template schema
export const ExportedMealTemplateSchema = z.object({
  id: z.string(),
  userId: z.string().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]).nullable().optional(),
  isPublic: z.boolean(),
  tags: z.array(z.string()),
  totalCalories: z.number(),
  totalProtein: z.number(),
  totalCarbs: z.number(),
  totalFats: z.number(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
  foodItems: z.array(ExportedMealTemplateItemSchema),
})

// Family Member schema
export const ExportedFamilyMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  relationship: z.string(),
  relationshipTypeId: z.string().nullable().optional(),
  birthday: isoDateString.nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
})

// Time Log schema
export const ExportedTimeLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  familyMemberId: z.string().nullable().optional(),
  activity: z.string(),
  activityTypeId: z.string().nullable().optional(),
  duration: z.number().int(),
  date: isoDateString,
  notes: z.string().nullable().optional(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
})

// Event schema
export const ExportedEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  familyMemberId: z.string().nullable().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  date: isoDateString,
  location: z.string().nullable().optional(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
})

// Reminder schema
export const ExportedReminderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  dueDate: isoDateString,
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  completed: z.boolean(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
})

// Catalog Item schema
export const ExportedCatalogItemSchema = z.object({
  id: z.string(),
  catalogType: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  level: z.number().int(),
  isSystem: z.boolean(),
  userId: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  sortOrder: z.number().int(),
  metadata: z.any().nullable().optional(),
  isActive: z.boolean(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
})

// Backup data schema
export const BackupDataSchema = z.object({
  profile: ExportedProfileSchema.nullable().optional(),
  workouts: z.array(ExportedWorkoutSchema).optional(),
  workoutTemplates: z.array(ExportedWorkoutTemplateSchema).optional(),
  transactions: z.array(ExportedTransactionSchema).optional(),
  investments: z.array(ExportedInvestmentSchema).optional(),
  budgets: z.array(ExportedBudgetSchema).optional(),
  meals: z.array(ExportedMealSchema).optional(),
  nutritionGoals: z.array(ExportedNutritionGoalSchema).optional(),
  mealTemplates: z.array(ExportedMealTemplateSchema).optional(),
  familyMembers: z.array(ExportedFamilyMemberSchema).optional(),
  timeLogs: z.array(ExportedTimeLogSchema).optional(),
  events: z.array(ExportedEventSchema).optional(),
  reminders: z.array(ExportedReminderSchema).optional(),
  catalogItems: z.array(ExportedCatalogItemSchema).optional(),
})

// Complete backup schema
export const BackupExportSchema = z.object({
  meta: BackupMetaSchema,
  data: BackupDataSchema,
})

// Type exports from schemas
export type BackupMetaInput = z.infer<typeof BackupMetaSchema>
export type BackupDataInput = z.infer<typeof BackupDataSchema>
export type BackupExportInput = z.infer<typeof BackupExportSchema>

/**
 * Validate a backup file
 */
export function validateBackup(data: unknown): {
  success: boolean
  data?: BackupExportInput
  errors?: Array<{ path: string; message: string }>
} {
  const result = BackupExportSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Zod v4 uses 'issues' instead of 'errors'
  return {
    success: false,
    errors: result.error.issues.map(e => ({
      path: e.path.map(p => String(p)).join("."),
      message: e.message
    }))
  }
}

/**
 * Check if backup version is compatible
 */
export function isVersionCompatible(version: string): boolean {
  const [major] = version.split(".")
  const [currentMajor] = BACKUP_VERSION.split(".")

  // Major version must match for compatibility
  return major === currentMajor
}
