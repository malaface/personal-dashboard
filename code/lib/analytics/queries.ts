/**
 * Analytics Queries
 * Purpose: Aggregation functions for dashboard analytics
 * Date: 2025-12-16
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================
// TYPES
// ============================================

export interface PortfolioAllocationData {
  typeName: string
  value: number
  percentage: number
  count: number
}

export interface GymVolumeData {
  date: string
  volume: number
  workoutCount: number
}

export interface FamilyTimeData {
  memberName: string
  totalMinutes: number
  activityCount: number
}

export interface NutritionMacrosData {
  date: string
  calories: number
  protein: number
  carbs: number
  fats: number
  mealCount: number
}

export interface AnalyticsDateRange {
  startDate: Date
  endDate: Date
}

export interface GymMuscleDistributionData {
  muscleGroupName: string
  totalVolume: number
  percentage: number
  exerciseCount: number
}

export interface GymEquipmentUsageData {
  equipmentName: string
  exerciseCount: number
  percentage: number
}

export interface FinanceCategoryUsageData {
  categoryName: string
  transactionCount: number
  percentage: number
}

export interface FinanceSpendingDistributionData {
  categoryName: string
  totalSpent: number
  percentage: number
  transactionCount: number
}

// ============================================
// 1. FINANCE ANALYTICS - Portfolio Allocation
// ============================================

/**
 * Get portfolio allocation by investment type
 * Groups investments by type and calculates total value and percentage
 */
export async function getPortfolioAllocation(
  userId: string
): Promise<PortfolioAllocationData[]> {
  try {
    // Get all investments with their types
    const investments = await prisma.investment.findMany({
      where: {
        userId,
        currentValue: { not: null }
      },
      include: {
        typeItem: {
          select: {
            name: true
          }
        }
      }
    })

    // Calculate total portfolio value
    const totalValue = investments.reduce(
      (sum, inv) => sum + (inv.currentValue || 0),
      0
    )

    // Group by type
    const grouped = investments.reduce((acc, inv) => {
      const typeName = inv.typeItem?.name || 'Unknown'

      if (!acc[typeName]) {
        acc[typeName] = {
          value: 0,
          count: 0
        }
      }

      acc[typeName].value += inv.currentValue || 0
      acc[typeName].count += 1

      return acc
    }, {} as Record<string, { value: number; count: number }>)

    // Format results
    const results: PortfolioAllocationData[] = Object.entries(grouped).map(
      ([typeName, data]) => ({
        typeName,
        value: Math.round(data.value * 100) / 100,
        percentage: Math.round((data.value / totalValue) * 10000) / 100, // 2 decimals
        count: data.count
      })
    )

    // Sort by value descending
    return results.sort((a, b) => b.value - a.value)
  } catch (error) {
    console.error('Error fetching portfolio allocation:', error)
    throw new Error('Failed to fetch portfolio allocation')
  }
}

// ============================================
// 2. GYM ANALYTICS - Volume Trends
// ============================================

/**
 * Get workout volume trends over date range
 * Aggregates daily workout volume (sets * reps * weight)
 */
export async function getGymVolumeTrends(
  userId: string,
  dateRange: AnalyticsDateRange
): Promise<GymVolumeData[]> {
  try {
    // Get all workouts in date range
    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      include: {
        exercises: {
          select: {
            sets: true,
            reps: true,
            weight: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Group by date and calculate volume
    const grouped = workouts.reduce((acc, workout) => {
      const dateKey = workout.date.toISOString().split('T')[0]

      // Calculate workout volume
      const workoutVolume = workout.exercises.reduce((sum, ex) => {
        return sum + (ex.sets * ex.reps * (ex.weight || 0))
      }, 0)

      if (!acc[dateKey]) {
        acc[dateKey] = {
          volume: 0,
          workoutCount: 0
        }
      }

      acc[dateKey].volume += workoutVolume
      acc[dateKey].workoutCount += 1

      return acc
    }, {} as Record<string, { volume: number; workoutCount: number }>)

    // Format results
    const results: GymVolumeData[] = Object.entries(grouped).map(
      ([date, data]) => ({
        date,
        volume: Math.round(data.volume * 100) / 100,
        workoutCount: data.workoutCount
      })
    )

    return results
  } catch (error) {
    console.error('Error fetching gym volume trends:', error)
    throw new Error('Failed to fetch gym volume trends')
  }
}

// ============================================
// 3. FAMILY ANALYTICS - Time Spent
// ============================================

/**
 * Get time spent with each family member
 * Aggregates time logs by family member
 */
export async function getFamilyTimeSpent(
  userId: string,
  dateRange: AnalyticsDateRange
): Promise<FamilyTimeData[]> {
  try {
    // Get all time logs with family members
    const timeLogs = await prisma.timeLog.findMany({
      where: {
        userId,
        familyMemberId: { not: null },
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      include: {
        familyMember: {
          select: {
            name: true
          }
        }
      }
    })

    // Group by family member
    const grouped = timeLogs.reduce((acc, log) => {
      const memberName = log.familyMember?.name || 'Unknown'

      if (!acc[memberName]) {
        acc[memberName] = {
          totalMinutes: 0,
          activityCount: 0
        }
      }

      acc[memberName].totalMinutes += log.duration
      acc[memberName].activityCount += 1

      return acc
    }, {} as Record<string, { totalMinutes: number; activityCount: number }>)

    // Format results
    const results: FamilyTimeData[] = Object.entries(grouped).map(
      ([memberName, data]) => ({
        memberName,
        totalMinutes: data.totalMinutes,
        activityCount: data.activityCount
      })
    )

    // Sort by total minutes descending
    return results.sort((a, b) => b.totalMinutes - a.totalMinutes)
  } catch (error) {
    console.error('Error fetching family time spent:', error)
    throw new Error('Failed to fetch family time spent')
  }
}

// ============================================
// 4. NUTRITION ANALYTICS - Macro Trends
// ============================================

/**
 * Get daily macro trends
 * Aggregates calories, protein, carbs, and fats by date
 */
export async function getNutritionMacroTrends(
  userId: string,
  dateRange: AnalyticsDateRange
): Promise<NutritionMacrosData[]> {
  try {
    // Get all meals with food items in date range
    const meals = await prisma.meal.findMany({
      where: {
        userId,
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      include: {
        foodItems: {
          select: {
            calories: true,
            protein: true,
            carbs: true,
            fats: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Group by date and sum macros
    const grouped = meals.reduce((acc, meal) => {
      const dateKey = meal.date.toISOString().split('T')[0]

      // Sum all macros from food items
      const macros = meal.foodItems.reduce(
        (sum, item) => ({
          calories: (sum.calories || 0) + (item.calories || 0),
          protein: (sum.protein || 0) + (item.protein || 0),
          carbs: (sum.carbs || 0) + (item.carbs || 0),
          fats: (sum.fats || 0) + (item.fats || 0)
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      )

      if (!acc[dateKey]) {
        acc[dateKey] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          mealCount: 0
        }
      }

      acc[dateKey].calories += (macros.calories || 0)
      acc[dateKey].protein += (macros.protein || 0)
      acc[dateKey].carbs += (macros.carbs || 0)
      acc[dateKey].fats += (macros.fats || 0)
      acc[dateKey].mealCount += 1

      return acc
    }, {} as Record<string, {
      calories: number
      protein: number
      carbs: number
      fats: number
      mealCount: number
    }>)

    // Format results
    const results: NutritionMacrosData[] = Object.entries(grouped).map(
      ([date, data]) => ({
        date,
        calories: Math.round(data.calories * 10) / 10,
        protein: Math.round(data.protein * 10) / 10,
        carbs: Math.round(data.carbs * 10) / 10,
        fats: Math.round(data.fats * 10) / 10,
        mealCount: data.mealCount
      })
    )

    return results
  } catch (error) {
    console.error('Error fetching nutrition macro trends:', error)
    throw new Error('Failed to fetch nutrition macro trends')
  }
}

// ============================================
// 5. GYM CATALOG ANALYTICS - Muscle Group Distribution
// ============================================

/**
 * Get workout volume distribution by muscle group
 * Groups exercises by muscle group and calculates total volume and percentage
 */
export async function getGymMuscleDistribution(
  userId: string
): Promise<GymMuscleDistributionData[]> {
  try {
    const dateRange = getDefaultDateRange()

    // Get all exercises with muscle group catalog items
    const exercises = await prisma.exercise.findMany({
      where: {
        workout: {
          userId,
          date: {
            gte: dateRange.startDate,
            lte: dateRange.endDate
          }
        },
        muscleGroupId: { not: null }
      },
      include: {
        muscleGroup: {
          select: { name: true }
        }
      }
    })

    // Calculate total volume
    const totalVolume = exercises.reduce(
      (sum, ex) => sum + (ex.sets * ex.reps * (ex.weight || 0)),
      0
    )

    // Group by muscle group
    const grouped = exercises.reduce((acc, ex) => {
      const groupName = ex.muscleGroup?.name || 'Sin Categoría'

      if (!acc[groupName]) {
        acc[groupName] = {
          totalVolume: 0,
          exerciseCount: 0
        }
      }

      acc[groupName].totalVolume += ex.sets * ex.reps * (ex.weight || 0)
      acc[groupName].exerciseCount += 1

      return acc
    }, {} as Record<string, { totalVolume: number; exerciseCount: number }>)

    // Format results
    const results: GymMuscleDistributionData[] = Object.entries(grouped).map(
      ([muscleGroupName, data]) => ({
        muscleGroupName,
        totalVolume: Math.round(data.totalVolume * 100) / 100,
        percentage: totalVolume > 0
          ? Math.round((data.totalVolume / totalVolume) * 10000) / 100
          : 0,
        exerciseCount: data.exerciseCount
      })
    )

    // Sort by volume descending
    return results.sort((a, b) => b.totalVolume - a.totalVolume)
  } catch (error) {
    console.error('Error fetching gym muscle distribution:', error)
    throw new Error('Failed to fetch gym muscle distribution')
  }
}

// ============================================
// 6. GYM CATALOG ANALYTICS - Equipment Usage
// ============================================

/**
 * Get equipment usage frequency
 * Groups exercises by equipment type and counts usage
 */
export async function getGymEquipmentUsage(
  userId: string
): Promise<GymEquipmentUsageData[]> {
  try {
    const dateRange = getDefaultDateRange()

    // Get all exercises with equipment catalog items
    const exercises = await prisma.exercise.findMany({
      where: {
        workout: {
          userId,
          date: {
            gte: dateRange.startDate,
            lte: dateRange.endDate
          }
        },
        equipmentId: { not: null }
      },
      include: {
        equipment: {
          select: { name: true }
        }
      }
    })

    const totalExercises = exercises.length

    // Group by equipment
    const grouped = exercises.reduce((acc, ex) => {
      const equipmentName = ex.equipment?.name || 'Sin Categoría'

      if (!acc[equipmentName]) {
        acc[equipmentName] = 0
      }

      acc[equipmentName] += 1

      return acc
    }, {} as Record<string, number>)

    // Format results
    const results: GymEquipmentUsageData[] = Object.entries(grouped).map(
      ([equipmentName, count]) => ({
        equipmentName,
        exerciseCount: count,
        percentage: totalExercises > 0
          ? Math.round((count / totalExercises) * 10000) / 100
          : 0
      })
    )

    // Sort by count descending
    return results.sort((a, b) => b.exerciseCount - a.exerciseCount)
  } catch (error) {
    console.error('Error fetching gym equipment usage:', error)
    throw new Error('Failed to fetch gym equipment usage')
  }
}

// ============================================
// 7. FINANCE CATALOG ANALYTICS - Category Usage Frequency
// ============================================

/**
 * Get transaction category usage frequency
 * Counts how often each category is used (last 30 days)
 */
export async function getFinanceCategoryUsage(
  userId: string
): Promise<FinanceCategoryUsageData[]> {
  try {
    const dateRange = getDefaultDateRange()

    // Get all transactions with category
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        },
        categoryId: { not: null }
      },
      include: {
        categoryItem: {
          select: { name: true }
        }
      }
    })

    const totalTransactions = transactions.length

    // Group by category
    const grouped = transactions.reduce((acc, tx) => {
      const categoryName = tx.categoryItem?.name || 'Sin Categoría'

      if (!acc[categoryName]) {
        acc[categoryName] = 0
      }

      acc[categoryName] += 1

      return acc
    }, {} as Record<string, number>)

    // Format results
    const results: FinanceCategoryUsageData[] = Object.entries(grouped).map(
      ([categoryName, count]) => ({
        categoryName,
        transactionCount: count,
        percentage: totalTransactions > 0
          ? Math.round((count / totalTransactions) * 10000) / 100
          : 0
      })
    )

    // Sort by count descending, limit to top 10
    return results.sort((a, b) => b.transactionCount - a.transactionCount).slice(0, 10)
  } catch (error) {
    console.error('Error fetching finance category usage:', error)
    throw new Error('Failed to fetch finance category usage')
  }
}

// ============================================
// 8. FINANCE CATALOG ANALYTICS - Spending Distribution
// ============================================

/**
 * Get spending distribution by category
 * Shows percentage of expenses by transaction category (last 30 days)
 */
export async function getFinanceSpendingDistribution(
  userId: string
): Promise<FinanceSpendingDistributionData[]> {
  try {
    const dateRange = getDefaultDateRange()

    // Get all expense transactions (amount < 0) with category
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        },
        amount: { lt: 0 }, // Only expenses
        categoryId: { not: null }
      },
      include: {
        categoryItem: {
          select: { name: true }
        }
      }
    })

    // Calculate total spending (absolute value)
    const totalSpent = transactions.reduce(
      (sum, tx) => sum + Math.abs(tx.amount),
      0
    )

    // Group by category
    const grouped = transactions.reduce((acc, tx) => {
      const categoryName = tx.categoryItem?.name || 'Sin Categoría'

      if (!acc[categoryName]) {
        acc[categoryName] = {
          totalSpent: 0,
          transactionCount: 0
        }
      }

      acc[categoryName].totalSpent += Math.abs(tx.amount)
      acc[categoryName].transactionCount += 1

      return acc
    }, {} as Record<string, { totalSpent: number; transactionCount: number }>)

    // Format results
    const results: FinanceSpendingDistributionData[] = Object.entries(grouped).map(
      ([categoryName, data]) => ({
        categoryName,
        totalSpent: Math.round(data.totalSpent * 100) / 100,
        percentage: totalSpent > 0
          ? Math.round((data.totalSpent / totalSpent) * 10000) / 100
          : 0,
        transactionCount: data.transactionCount
      })
    )

    // Sort by amount descending
    return results.sort((a, b) => b.totalSpent - a.totalSpent)
  } catch (error) {
    console.error('Error fetching finance spending distribution:', error)
    throw new Error('Failed to fetch finance spending distribution')
  }
}

// ============================================
// HELPER: Get default date range (last 30 days)
// ============================================

export function getDefaultDateRange(): AnalyticsDateRange {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  return { startDate, endDate }
}
