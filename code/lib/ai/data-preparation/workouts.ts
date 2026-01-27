import { prisma } from '@/lib/db/prisma'
import { subDays } from 'date-fns'
import { WorkoutsData } from '../types'

/**
 * Prepare workout data for AI analysis
 * Filters workouts by period and calculates key metrics
 *
 * @param userId - User ID
 * @param periodDays - Number of days to analyze (7 or 30)
 * @returns Prepared workout data with metrics
 */
export async function prepareWorkoutsData(
  userId: string,
  periodDays: number
): Promise<WorkoutsData> {
  const startDate = subDays(new Date(), periodDays)
  const endDate = new Date()

  // Fetch workouts with exercises
  const workouts = await prisma.workout.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      exercises: {
        include: {
          exerciseType: {
            select: { name: true },
          },
          muscleGroup: {
            select: { name: true },
          },
          equipment: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
    take: 30, // Limit to 30 most recent workouts
  })

  // Calculate total volume (sets × reps × weight)
  const totalVolume = workouts.reduce((sum, workout) =>
    sum + workout.exercises.reduce((exSum, exercise) =>
      exSum + (exercise.sets * exercise.reps * (exercise.weight || 0)), 0
    ), 0
  )

  // Calculate average volume per workout
  const avgVolume = workouts.length > 0 ? totalVolume / workouts.length : 0

  // Muscle group distribution
  const muscleGroups: Record<string, number> = {}
  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const group = exercise.muscleGroup?.name || 'Unknown'
      muscleGroups[group] = (muscleGroups[group] || 0) + 1
    })
  })

  // Equipment usage
  const equipment: Record<string, number> = {}
  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const eq = exercise.equipment?.name || 'Bodyweight'
      equipment[eq] = (equipment[eq] || 0) + 1
    })
  })

  // Volume trend (compare recent 7 days vs previous 7 days)
  const midPoint = subDays(endDate, Math.floor(periodDays / 2))

  const recentVolume = workouts
    .filter(w => w.date >= midPoint)
    .reduce((sum, w) => sum + w.exercises.reduce((exSum, e) =>
      exSum + (e.sets * e.reps * (e.weight || 0)), 0
    ), 0)

  const previousVolume = workouts
    .filter(w => w.date < midPoint)
    .reduce((sum, w) => sum + w.exercises.reduce((exSum, e) =>
      exSum + (e.sets * e.reps * (e.weight || 0)), 0
    ), 0)

  const volumeTrend: 'increasing' | 'decreasing' | 'stable' =
    recentVolume > previousVolume * 1.1 ? 'increasing' :
    recentVolume < previousVolume * 0.9 ? 'decreasing' : 'stable'

  // Frequency (workouts per week)
  const frequency = (workouts.length / periodDays) * 7

  // Format workouts for AI (simplified structure)
  const formattedWorkouts = workouts.slice(0, 10).map(workout => ({
    date: workout.date.toISOString().split('T')[0],
    name: workout.name,
    duration: workout.duration,
    notes: workout.notes ? workout.notes.substring(0, 100) : null, // Limit notes
    exercises: workout.exercises.map(exercise => ({
      type: exercise.exerciseType?.name || exercise.name || 'Unknown',
      muscleGroup: exercise.muscleGroup?.name || null,
      equipment: exercise.equipment?.name || null,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      volume: exercise.sets * exercise.reps * (exercise.weight || 0),
    })),
    totalVolume: workout.exercises.reduce((sum, e) =>
      sum + (e.sets * e.reps * (e.weight || 0)), 0
    ),
  }))

  return {
    workouts: formattedWorkouts,
    totalVolume: Math.round(totalVolume),
    avgVolume: Math.round(avgVolume),
    muscleGroups,
    equipment,
    volumeTrend,
    frequency: Math.round(frequency * 10) / 10,
    periodDays,
    dataPoints: workouts.length,
  }
}
