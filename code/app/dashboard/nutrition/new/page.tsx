import { requireAuth } from "@/lib/auth/utils"
import Link from "next/link"
import MealForm from "@/components/nutrition/MealForm"

export default async function NewMealPage() {
  await requireAuth()

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/nutrition"
            className="text-orange-600 hover:text-orange-700 text-sm"
          >
            ← Back to Nutrition
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Log New Meal</h1>

        <MealForm />
      </div>
    </div>
  )
}
