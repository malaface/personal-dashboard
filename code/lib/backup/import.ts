/**
 * Import Logic - Validates and imports backup data
 */

import { prisma } from "@/lib/db/prisma"
import { createId } from "@paralleldrive/cuid2"
import type {
  BackupExport,
  ImportMode,
  ImportPreview,
  ImportResult,
} from "./types"
import { validateBackup, isVersionCompatible } from "./schemas"
import { BACKUP_VERSION } from "./types"

/**
 * Preview import - validates backup and returns counts without importing
 */
export async function previewImport(backupData: unknown): Promise<ImportPreview> {
  const validation = validateBackup(backupData)

  if (!validation.success) {
    return {
      valid: false,
      version: "unknown",
      exportDate: "unknown",
      sourceEmail: "unknown",
      counts: {
        profile: 0,
        workouts: 0,
        workoutTemplates: 0,
        transactions: 0,
        investments: 0,
        budgets: 0,
        meals: 0,
        nutritionGoals: 0,
        mealTemplates: 0,
        familyMembers: 0,
        timeLogs: 0,
        events: 0,
        reminders: 0,
        catalogItems: 0,
      },
      warnings: [],
      errors: validation.errors?.map((e: { path: string; message: string }) => `${e.path}: ${e.message}`) || ["Invalid backup format"],
    }
  }

  const backup = validation.data!
  const warnings: string[] = []

  // Check version compatibility
  if (!isVersionCompatible(backup.meta.version)) {
    warnings.push(`Backup version ${backup.meta.version} may not be fully compatible with current version ${BACKUP_VERSION}`)
  }

  // Count items that would be imported
  const data = backup.data
  const counts = {
    profile: data.profile ? 1 : 0,
    workouts: data.workouts?.length || 0,
    workoutTemplates: data.workoutTemplates?.length || 0,
    transactions: data.transactions?.length || 0,
    investments: data.investments?.length || 0,
    budgets: data.budgets?.length || 0,
    meals: data.meals?.length || 0,
    nutritionGoals: data.nutritionGoals?.length || 0,
    mealTemplates: data.mealTemplates?.length || 0,
    familyMembers: data.familyMembers?.length || 0,
    timeLogs: data.timeLogs?.length || 0,
    events: data.events?.length || 0,
    reminders: data.reminders?.length || 0,
    catalogItems: data.catalogItems?.filter(item => !item.isSystem).length || 0,
  }

  // Add warning if there are system catalog items
  const systemItems = data.catalogItems?.filter(item => item.isSystem).length || 0
  if (systemItems > 0) {
    warnings.push(`${systemItems} system catalog items will be skipped (system items cannot be imported)`)
  }

  return {
    valid: true,
    version: backup.meta.version,
    exportDate: backup.meta.exportDate,
    sourceEmail: backup.meta.userEmail,
    counts,
    warnings,
    errors: [],
  }
}

/**
 * Import backup data into the database
 * Mode: "merge" (default) - adds data without deleting existing
 * Mode: "replace" - deletes existing data first
 */
export async function importUserData(
  userId: string,
  backupData: unknown,
  mode: ImportMode = "merge"
): Promise<ImportResult> {
  const validation = validateBackup(backupData)

  if (!validation.success) {
    return {
      success: false,
      imported: {
        profile: 0,
        workouts: 0,
        workoutTemplates: 0,
        transactions: 0,
        investments: 0,
        budgets: 0,
        meals: 0,
        nutritionGoals: 0,
        mealTemplates: 0,
        familyMembers: 0,
        timeLogs: 0,
        events: 0,
        reminders: 0,
        catalogItems: 0,
      },
      skipped: { catalogItems: 0 },
      errors: validation.errors?.map((e: { path: string; message: string }) => `${e.path}: ${e.message}`) || ["Invalid backup format"],
    }
  }

  const backup = validation.data!
  const data = backup.data

  // Track imported counts
  const imported = {
    profile: 0,
    workouts: 0,
    workoutTemplates: 0,
    transactions: 0,
    investments: 0,
    budgets: 0,
    meals: 0,
    nutritionGoals: 0,
    mealTemplates: 0,
    familyMembers: 0,
    timeLogs: 0,
    events: 0,
    reminders: 0,
    catalogItems: 0,
  }
  const skipped = { catalogItems: 0 }
  const errors: string[] = []

  // ID mapping: oldId -> newId
  const idMap = new Map<string, string>()

  try {
    await prisma.$transaction(async (tx) => {
      // If replace mode, delete existing data first
      if (mode === "replace") {
        // Delete in correct order (children before parents)
        await tx.workoutProgress.deleteMany({ where: { exercise: { workout: { userId } } } })
        await tx.exercise.deleteMany({ where: { workout: { userId } } })
        await tx.workout.deleteMany({ where: { userId } })
        await tx.workoutTemplateExercise.deleteMany({ where: { template: { userId } } })
        await tx.workoutTemplate.deleteMany({ where: { userId } })
        await tx.transactionAudit.deleteMany({ where: { transaction: { userId } } })
        await tx.transaction.deleteMany({ where: { userId } })
        await tx.investment.deleteMany({ where: { userId } })
        await tx.budget.deleteMany({ where: { userId } })
        await tx.foodItem.deleteMany({ where: { meal: { userId } } })
        await tx.meal.deleteMany({ where: { userId } })
        await tx.nutritionGoal.deleteMany({ where: { userId } })
        await tx.mealTemplateItem.deleteMany({ where: { template: { userId } } })
        await tx.mealTemplate.deleteMany({ where: { userId } })
        await tx.timeLog.deleteMany({ where: { userId } })
        await tx.event.deleteMany({ where: { userId } })
        await tx.reminder.deleteMany({ where: { userId } })
        await tx.familyMember.deleteMany({ where: { userId } })
        // Delete user catalog items (not system)
        await tx.catalogItem.deleteMany({ where: { userId, isSystem: false } })
        // Don't delete profile in replace mode - just update it
      }

      // Import Catalog Items first (needed for foreign key references)
      if (data.catalogItems) {
        for (const item of data.catalogItems) {
          // Skip system items
          if (item.isSystem) {
            skipped.catalogItems++
            continue
          }

          const newId = createId()
          idMap.set(item.id, newId)

          // Check if item with same slug exists for this user
          const existing = await tx.catalogItem.findFirst({
            where: {
              catalogType: item.catalogType,
              slug: item.slug,
              userId,
            },
          })

          if (existing && mode === "merge") {
            // In merge mode, use existing item's ID
            idMap.set(item.id, existing.id)
          } else {
            await tx.catalogItem.create({
              data: {
                id: newId,
                catalogType: item.catalogType,
                name: item.name,
                slug: item.slug,
                description: item.description,
                parentId: item.parentId ? (idMap.get(item.parentId) || null) : null,
                level: item.level,
                isSystem: false,
                userId,
                icon: item.icon,
                color: item.color,
                sortOrder: item.sortOrder,
                metadata: item.metadata,
                isActive: item.isActive,
              },
            })
            imported.catalogItems++
          }
        }
      }

      // Import Profile
      if (data.profile) {
        const existingProfile = await tx.profile.findUnique({ where: { userId } })

        if (existingProfile) {
          await tx.profile.update({
            where: { userId },
            data: {
              bio: data.profile.bio,
              birthday: data.profile.birthday ? new Date(data.profile.birthday) : null,
              phone: data.profile.phone,
              country: data.profile.country,
              city: data.profile.city,
              timezone: data.profile.timezone,
            },
          })
        } else {
          await tx.profile.create({
            data: {
              id: createId(),
              userId,
              bio: data.profile.bio,
              birthday: data.profile.birthday ? new Date(data.profile.birthday) : null,
              phone: data.profile.phone,
              country: data.profile.country,
              city: data.profile.city,
              timezone: data.profile.timezone,
            },
          })
        }
        imported.profile = 1
      }

      // Import Family Members (before TimeLogs and Events that reference them)
      if (data.familyMembers) {
        for (const member of data.familyMembers) {
          const newId = createId()
          idMap.set(member.id, newId)

          await tx.familyMember.create({
            data: {
              id: newId,
              userId,
              name: member.name,
              relationship: member.relationship,
              relationshipTypeId: member.relationshipTypeId ? (idMap.get(member.relationshipTypeId) || member.relationshipTypeId) : null,
              birthday: member.birthday ? new Date(member.birthday) : null,
              email: member.email,
              phone: member.phone,
              notes: member.notes,
            },
          })
          imported.familyMembers++
        }
      }

      // Import Workouts with Exercises
      if (data.workouts) {
        for (const workout of data.workouts) {
          const workoutNewId = createId()
          idMap.set(workout.id, workoutNewId)

          await tx.workout.create({
            data: {
              id: workoutNewId,
              userId,
              name: workout.name,
              date: new Date(workout.date),
              duration: workout.duration,
              notes: workout.notes,
            },
          })

          // Import exercises
          for (const exercise of workout.exercises) {
            const exerciseNewId = createId()
            idMap.set(exercise.id, exerciseNewId)

            await tx.exercise.create({
              data: {
                id: exerciseNewId,
                workoutId: workoutNewId,
                name: exercise.name,
                exerciseTypeId: exercise.exerciseTypeId ? (idMap.get(exercise.exerciseTypeId) || exercise.exerciseTypeId) : null,
                muscleGroupId: exercise.muscleGroupId ? (idMap.get(exercise.muscleGroupId) || exercise.muscleGroupId) : null,
                equipmentId: exercise.equipmentId ? (idMap.get(exercise.equipmentId) || exercise.equipmentId) : null,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
                notes: exercise.notes,
              },
            })

            // Import workout progress
            if (exercise.progress) {
              for (const progress of exercise.progress) {
                await tx.workoutProgress.create({
                  data: {
                    id: createId(),
                    exerciseId: exerciseNewId,
                    date: new Date(progress.date),
                    sets: progress.sets,
                    reps: progress.reps,
                    weight: progress.weight,
                    volume: progress.volume,
                  },
                })
              }
            }
          }

          imported.workouts++
        }
      }

      // Import Workout Templates
      if (data.workoutTemplates) {
        for (const template of data.workoutTemplates) {
          const templateNewId = createId()
          idMap.set(template.id, templateNewId)

          await tx.workoutTemplate.create({
            data: {
              id: templateNewId,
              userId,
              name: template.name,
              description: template.description,
              isPublic: false, // Imported templates are always private
              difficulty: template.difficulty,
              tags: template.tags,
            },
          })

          // Import template exercises
          for (const exercise of template.exercises) {
            await tx.workoutTemplateExercise.create({
              data: {
                id: createId(),
                templateId: templateNewId,
                exerciseTypeId: exercise.exerciseTypeId ? (idMap.get(exercise.exerciseTypeId) || exercise.exerciseTypeId) : null,
                muscleGroupId: exercise.muscleGroupId ? (idMap.get(exercise.muscleGroupId) || exercise.muscleGroupId) : null,
                equipmentId: exercise.equipmentId ? (idMap.get(exercise.equipmentId) || exercise.equipmentId) : null,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
                notes: exercise.notes,
                sortOrder: exercise.sortOrder,
              },
            })
          }

          imported.workoutTemplates++
        }
      }

      // Import Transactions
      if (data.transactions) {
        for (const transaction of data.transactions) {
          const newId = createId()
          idMap.set(transaction.id, newId)

          await tx.transaction.create({
            data: {
              id: newId,
              userId,
              type: transaction.type,
              category: transaction.category,
              typeId: transaction.typeId ? (idMap.get(transaction.typeId) || transaction.typeId) : null,
              categoryId: transaction.categoryId ? (idMap.get(transaction.categoryId) || transaction.categoryId) : null,
              amount: transaction.amount,
              description: transaction.description,
              date: new Date(transaction.date),
            },
          })
          imported.transactions++
        }
      }

      // Import Investments
      if (data.investments) {
        for (const investment of data.investments) {
          const newId = createId()
          idMap.set(investment.id, newId)

          await tx.investment.create({
            data: {
              id: newId,
              userId,
              name: investment.name,
              type: investment.type,
              typeId: investment.typeId ? (idMap.get(investment.typeId) || investment.typeId) : null,
              amount: investment.amount,
              currentValue: investment.currentValue,
              purchaseDate: new Date(investment.purchaseDate),
              notes: investment.notes,
            },
          })
          imported.investments++
        }
      }

      // Import Budgets
      if (data.budgets) {
        for (const budget of data.budgets) {
          const newId = createId()
          idMap.set(budget.id, newId)

          await tx.budget.create({
            data: {
              id: newId,
              userId,
              category: budget.category,
              categoryId: budget.categoryId ? (idMap.get(budget.categoryId) || budget.categoryId) : null,
              limit: budget.limit,
              month: new Date(budget.month),
              spent: budget.spent,
            },
          })
          imported.budgets++
        }
      }

      // Import Meals with FoodItems
      if (data.meals) {
        for (const meal of data.meals) {
          const mealNewId = createId()
          idMap.set(meal.id, mealNewId)

          await tx.meal.create({
            data: {
              id: mealNewId,
              userId,
              name: meal.name,
              mealType: meal.mealType,
              date: new Date(meal.date),
              notes: meal.notes,
            },
          })

          // Import food items
          for (const foodItem of meal.foodItems) {
            await tx.foodItem.create({
              data: {
                id: createId(),
                mealId: mealNewId,
                name: foodItem.name,
                quantity: foodItem.quantity,
                unit: foodItem.unit,
                calories: foodItem.calories,
                protein: foodItem.protein,
                carbs: foodItem.carbs,
                fats: foodItem.fats,
              },
            })
          }

          imported.meals++
        }
      }

      // Import Nutrition Goals
      if (data.nutritionGoals) {
        for (const goal of data.nutritionGoals) {
          await tx.nutritionGoal.create({
            data: {
              id: createId(),
              userId,
              calories: goal.calories,
              protein: goal.protein,
              carbs: goal.carbs,
              fats: goal.fats,
              date: new Date(goal.date),
            },
          })
          imported.nutritionGoals++
        }
      }

      // Import Meal Templates
      if (data.mealTemplates) {
        for (const template of data.mealTemplates) {
          const templateNewId = createId()
          idMap.set(template.id, templateNewId)

          await tx.mealTemplate.create({
            data: {
              id: templateNewId,
              userId,
              name: template.name,
              description: template.description,
              mealType: template.mealType,
              isPublic: false, // Imported templates are always private
              tags: template.tags,
              totalCalories: template.totalCalories,
              totalProtein: template.totalProtein,
              totalCarbs: template.totalCarbs,
              totalFats: template.totalFats,
            },
          })

          // Import template items
          for (const item of template.foodItems) {
            await tx.mealTemplateItem.create({
              data: {
                id: createId(),
                templateId: templateNewId,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fats: item.fats,
                sortOrder: item.sortOrder,
              },
            })
          }

          imported.mealTemplates++
        }
      }

      // Import Time Logs
      if (data.timeLogs) {
        for (const log of data.timeLogs) {
          await tx.timeLog.create({
            data: {
              id: createId(),
              userId,
              familyMemberId: log.familyMemberId ? (idMap.get(log.familyMemberId) || null) : null,
              activity: log.activity,
              activityTypeId: log.activityTypeId ? (idMap.get(log.activityTypeId) || log.activityTypeId) : null,
              duration: log.duration,
              date: new Date(log.date),
              notes: log.notes,
            },
          })
          imported.timeLogs++
        }
      }

      // Import Events
      if (data.events) {
        for (const event of data.events) {
          await tx.event.create({
            data: {
              id: createId(),
              userId,
              familyMemberId: event.familyMemberId ? (idMap.get(event.familyMemberId) || null) : null,
              title: event.title,
              description: event.description,
              categoryId: event.categoryId ? (idMap.get(event.categoryId) || event.categoryId) : null,
              date: new Date(event.date),
              location: event.location,
            },
          })
          imported.events++
        }
      }

      // Import Reminders
      if (data.reminders) {
        for (const reminder of data.reminders) {
          await tx.reminder.create({
            data: {
              id: createId(),
              userId,
              title: reminder.title,
              description: reminder.description,
              categoryId: reminder.categoryId ? (idMap.get(reminder.categoryId) || reminder.categoryId) : null,
              dueDate: new Date(reminder.dueDate),
              priority: reminder.priority,
              completed: reminder.completed,
            },
          })
          imported.reminders++
        }
      }
    }, {
      timeout: 60000, // 60 second timeout for large imports
    })

    return {
      success: true,
      imported,
      skipped,
      errors,
    }
  } catch (error) {
    console.error("Import error:", error)
    return {
      success: false,
      imported,
      skipped,
      errors: [error instanceof Error ? error.message : "Unknown error during import"],
    }
  }
}
