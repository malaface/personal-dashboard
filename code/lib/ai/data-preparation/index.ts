import { prepareWorkoutsData } from './workouts'
import { PrepareDataParams, ModuleData } from '../types'

/**
 * Main entry point for data preparation
 * Routes to the appropriate module-specific preparation function
 *
 * @param params - Module, user ID, and period
 * @returns Prepared data for AI analysis
 */
export async function prepareModuleData(
  params: PrepareDataParams
): Promise<ModuleData> {
  const periodDays = params.period === '7days' ? 7 : 30

  switch (params.module) {
    case 'workouts':
      return prepareWorkoutsData(params.userId, periodDays)

    case 'finance':
      // TODO: Implement finance data preparation
      throw new Error('Finance module not yet implemented')

    case 'nutrition':
      // TODO: Implement nutrition data preparation
      throw new Error('Nutrition module not yet implemented')

    case 'family':
      // TODO: Implement family data preparation
      throw new Error('Family module not yet implemented')

    default:
      throw new Error(`Unknown module: ${params.module}`)
  }
}
