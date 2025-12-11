import { requireAuth } from "@/lib/auth/utils"
import WorkoutForm from "@/components/workouts/WorkoutForm"
import Link from "next/link"

export default async function NewWorkoutPage() {
  await requireAuth()

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard/workouts"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Back to Workouts
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">New Workout</h1>
          <p className="text-gray-600 mt-2">Log your workout session</p>
        </div>

        <WorkoutForm />
      </div>
    </div>
  )
}
