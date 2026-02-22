/**
 * Backup Types - Type definitions for export/import functionality
 */

import type {
  Profile,
  Workout,
  Exercise,
  WorkoutProgress,
  WorkoutTemplate,
  WorkoutTemplateExercise,
  Transaction,
  Investment,
  Budget,
  Meal,
  FoodItem,
  NutritionGoal,
  MealTemplate,
  MealTemplateItem,
  FamilyMember,
  TimeLog,
  Event,
  Reminder,
  CatalogItem,
} from "@prisma/client"

// Available modules for export/import
export const ALL_MODULES = [
  "profile",
  "workouts",
  "finance",
  "nutrition",
  "family",
  "catalog"
] as const

export type BackupModule = typeof ALL_MODULES[number]

// Metadata about the backup
export interface BackupMeta {
  version: string
  exportDate: string
  userId: string
  userEmail: string
  modules: BackupModule[]
}

// Types for exported data (with relations)
export interface ExportedWorkout extends Omit<Workout, "createdAt" | "updatedAt"> {
  createdAt: string
  updatedAt: string
  exercises: ExportedExercise[]
}

export interface ExportedExercise extends Omit<Exercise, "createdAt" | "updatedAt"> {
  createdAt: string
  updatedAt: string
  progress?: ExportedWorkoutProgress[]
}

export interface ExportedWorkoutProgress extends Omit<WorkoutProgress, "createdAt" | "date"> {
  createdAt: string
  date: string
}

export interface ExportedWorkoutTemplate extends Omit<WorkoutTemplate, "createdAt" | "updatedAt"> {
  createdAt: string
  updatedAt: string
  exercises: ExportedWorkoutTemplateExercise[]
}

export interface ExportedWorkoutTemplateExercise extends Omit<WorkoutTemplateExercise, "createdAt" | "updatedAt"> {
  createdAt: string
  updatedAt: string
}

export interface ExportedTransaction extends Omit<Transaction, "createdAt" | "updatedAt" | "date"> {
  createdAt: string
  updatedAt: string
  date: string
}

export interface ExportedInvestment extends Omit<Investment, "createdAt" | "updatedAt" | "purchaseDate"> {
  createdAt: string
  updatedAt: string
  purchaseDate: string
}

export interface ExportedBudget extends Omit<Budget, "createdAt" | "updatedAt" | "month"> {
  createdAt: string
  updatedAt: string
  month: string
}

export interface ExportedMeal extends Omit<Meal, "createdAt" | "updatedAt" | "date"> {
  createdAt: string
  updatedAt: string
  date: string
  foodItems: ExportedFoodItem[]
}

export interface ExportedFoodItem extends Omit<FoodItem, "createdAt" | "updatedAt"> {
  createdAt: string
  updatedAt: string
}

export interface ExportedNutritionGoal extends Omit<NutritionGoal, "createdAt" | "updatedAt" | "date"> {
  createdAt: string
  updatedAt: string
  date: string
}

export interface ExportedMealTemplate extends Omit<MealTemplate, "createdAt" | "updatedAt"> {
  createdAt: string
  updatedAt: string
  foodItems: ExportedMealTemplateItem[]
}

export interface ExportedMealTemplateItem extends Omit<MealTemplateItem, "createdAt" | "updatedAt"> {
  createdAt: string
  updatedAt: string
}

export interface ExportedFamilyMember extends Omit<FamilyMember, "createdAt" | "updatedAt" | "birthday"> {
  createdAt: string
  updatedAt: string
  birthday?: string | null
}

export interface ExportedTimeLog extends Omit<TimeLog, "createdAt" | "updatedAt" | "date"> {
  createdAt: string
  updatedAt: string
  date: string
}

export interface ExportedEvent extends Omit<Event, "createdAt" | "updatedAt" | "date"> {
  createdAt: string
  updatedAt: string
  date: string
}

export interface ExportedReminder extends Omit<Reminder, "createdAt" | "updatedAt" | "dueDate"> {
  createdAt: string
  updatedAt: string
  dueDate: string
}

export interface ExportedCatalogItem extends Omit<CatalogItem, "createdAt" | "updatedAt"> {
  createdAt: string
  updatedAt: string
}

export interface ExportedProfile extends Omit<Profile, "createdAt" | "updatedAt" | "birthday"> {
  createdAt: string
  updatedAt: string
  birthday?: string | null
}

// Main backup data structure
export interface BackupData {
  // Profile
  profile?: ExportedProfile | null

  // Gym Module
  workouts?: ExportedWorkout[]
  workoutTemplates?: ExportedWorkoutTemplate[]

  // Finance Module
  transactions?: ExportedTransaction[]
  investments?: ExportedInvestment[]
  budgets?: ExportedBudget[]

  // Nutrition Module
  meals?: ExportedMeal[]
  nutritionGoals?: ExportedNutritionGoal[]
  mealTemplates?: ExportedMealTemplate[]

  // Family Module
  familyMembers?: ExportedFamilyMember[]
  timeLogs?: ExportedTimeLog[]
  events?: ExportedEvent[]
  reminders?: ExportedReminder[]

  // Catalog (user-specific only, not system)
  catalogItems?: ExportedCatalogItem[]
}

// Complete backup structure
export interface BackupExport {
  meta: BackupMeta
  data: BackupData
}

// Import mode
export type ImportMode = "merge" | "replace"

// Import preview result
export interface ImportPreview {
  valid: boolean
  version: string
  exportDate: string
  sourceEmail: string
  counts: {
    profile: number
    workouts: number
    workoutTemplates: number
    transactions: number
    investments: number
    budgets: number
    meals: number
    nutritionGoals: number
    mealTemplates: number
    familyMembers: number
    timeLogs: number
    events: number
    reminders: number
    catalogItems: number
  }
  warnings: string[]
  errors: string[]
}

// Import result
export interface ImportResult {
  success: boolean
  imported: {
    profile: number
    workouts: number
    workoutTemplates: number
    transactions: number
    investments: number
    budgets: number
    meals: number
    nutritionGoals: number
    mealTemplates: number
    familyMembers: number
    timeLogs: number
    events: number
    reminders: number
    catalogItems: number
  }
  skipped: {
    catalogItems: number // System catalog items are skipped
  }
  errors: string[]
}

// Current backup version
export const BACKUP_VERSION = "1.0.0"

// Maximum backup file size (10MB)
export const MAX_BACKUP_SIZE = 10 * 1024 * 1024
