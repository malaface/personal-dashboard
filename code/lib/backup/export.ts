/**
 * Export Logic - Fetches all user data for backup
 */

import { prisma } from "@/lib/db/prisma"
import type {
  BackupExport,
  BackupData,
  BackupModule,
} from "./types"
import { ALL_MODULES, BACKUP_VERSION } from "./types"

/**
 * Convert Date objects to ISO strings recursively
 */
function serializeDates<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (obj instanceof Date) {
    return obj.toISOString() as unknown as T
  }

  if (Array.isArray(obj)) {
    return obj.map(item => serializeDates(item)) as unknown as T
  }

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeDates(value)
    }
    return result as T
  }

  return obj
}

/**
 * Export all user data or specific modules
 */
export async function exportUserData(
  userId: string,
  userEmail: string,
  modules?: BackupModule[]
): Promise<BackupExport> {
  const selectedModules = modules || [...ALL_MODULES]

  const data: BackupData = {}

  // Fetch data in parallel for better performance
  const fetchPromises: Promise<void>[] = []

  // Profile
  if (selectedModules.includes("profile")) {
    fetchPromises.push(
      prisma.profile.findUnique({
        where: { userId },
      }).then(profile => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.profile = profile ? serializeDates(profile) as any : null
      })
    )
  }

  // Workouts (Gym Module)
  if (selectedModules.includes("workouts")) {
    fetchPromises.push(
      prisma.workout.findMany({
        where: { userId },
        include: {
          exercises: {
            include: {
              progress: true,
            },
          },
        },
        orderBy: { date: "desc" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }).then(workouts => {
        data.workouts = serializeDates(workouts) as any
      })
    )

    fetchPromises.push(
      prisma.workoutTemplate.findMany({
        where: { userId },
        include: {
          exercises: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { name: "asc" },
      }).then(templates => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.workoutTemplates = serializeDates(templates) as any
      })
    )
  }

  // Finance Module
  if (selectedModules.includes("finance")) {
    fetchPromises.push(
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" },
      }).then(transactions => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.transactions = serializeDates(transactions) as any
      })
    )

    fetchPromises.push(
      prisma.investment.findMany({
        where: { userId },
        orderBy: { purchaseDate: "desc" },
      }).then(investments => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.investments = serializeDates(investments) as any
      })
    )

    fetchPromises.push(
      prisma.budget.findMany({
        where: { userId },
        orderBy: { month: "desc" },
      }).then(budgets => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.budgets = serializeDates(budgets) as any
      })
    )
  }

  // Nutrition Module
  if (selectedModules.includes("nutrition")) {
    fetchPromises.push(
      prisma.meal.findMany({
        where: { userId },
        include: {
          foodItems: true,
        },
        orderBy: { date: "desc" },
      }).then(meals => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.meals = serializeDates(meals) as any
      })
    )

    fetchPromises.push(
      prisma.nutritionGoal.findMany({
        where: { userId },
        orderBy: { date: "desc" },
      }).then(goals => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.nutritionGoals = serializeDates(goals) as any
      })
    )

    fetchPromises.push(
      prisma.mealTemplate.findMany({
        where: { userId },
        include: {
          foodItems: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { name: "asc" },
      }).then(templates => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.mealTemplates = serializeDates(templates) as any
      })
    )
  }

  // Family Module
  if (selectedModules.includes("family")) {
    fetchPromises.push(
      prisma.familyMember.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      }).then(members => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.familyMembers = serializeDates(members) as any
      })
    )

    fetchPromises.push(
      prisma.timeLog.findMany({
        where: { userId },
        orderBy: { date: "desc" },
      }).then(logs => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.timeLogs = serializeDates(logs) as any
      })
    )

    fetchPromises.push(
      prisma.event.findMany({
        where: { userId },
        orderBy: { date: "desc" },
      }).then(events => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.events = serializeDates(events) as any
      })
    )

    fetchPromises.push(
      prisma.reminder.findMany({
        where: { userId },
        orderBy: { dueDate: "desc" },
      }).then(reminders => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.reminders = serializeDates(reminders) as any
      })
    )
  }

  // Catalog (user-specific items only, not system)
  if (selectedModules.includes("catalog")) {
    fetchPromises.push(
      prisma.catalogItem.findMany({
        where: {
          userId,
          isSystem: false, // Only user-created items
        },
        orderBy: [{ catalogType: "asc" }, { level: "asc" }, { sortOrder: "asc" }],
      }).then(items => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.catalogItems = serializeDates(items) as any
      })
    )
  }

  // Wait for all fetches to complete
  await Promise.all(fetchPromises)

  // Build the backup export structure
  const backup: BackupExport = {
    meta: {
      version: BACKUP_VERSION,
      exportDate: new Date().toISOString(),
      userId,
      userEmail,
      modules: selectedModules,
    },
    data,
  }

  return backup
}

/**
 * Get counts of exportable data for preview
 */
export async function getExportCounts(userId: string): Promise<{
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
}> {
  const [
    profile,
    workouts,
    workoutTemplates,
    transactions,
    investments,
    budgets,
    meals,
    nutritionGoals,
    mealTemplates,
    familyMembers,
    timeLogs,
    events,
    reminders,
    catalogItems,
  ] = await Promise.all([
    prisma.profile.count({ where: { userId } }),
    prisma.workout.count({ where: { userId } }),
    prisma.workoutTemplate.count({ where: { userId } }),
    prisma.transaction.count({ where: { userId } }),
    prisma.investment.count({ where: { userId } }),
    prisma.budget.count({ where: { userId } }),
    prisma.meal.count({ where: { userId } }),
    prisma.nutritionGoal.count({ where: { userId } }),
    prisma.mealTemplate.count({ where: { userId } }),
    prisma.familyMember.count({ where: { userId } }),
    prisma.timeLog.count({ where: { userId } }),
    prisma.event.count({ where: { userId } }),
    prisma.reminder.count({ where: { userId } }),
    prisma.catalogItem.count({ where: { userId, isSystem: false } }),
  ])

  return {
    profile,
    workouts,
    workoutTemplates,
    transactions,
    investments,
    budgets,
    meals,
    nutritionGoals,
    mealTemplates,
    familyMembers,
    timeLogs,
    events,
    reminders,
    catalogItems,
  }
}
