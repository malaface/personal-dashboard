import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import Link from "next/link"
import MealList from "@/components/nutrition/MealList"

export default async function NutritionPage() {
  const user = await requireAuth()

  const meals = await prisma.meal.findMany({
    where: {
      userId: user.id,
    },
    include: {
      foodItems: true,
    },
    orderBy: {
      date: "desc",
    },
  })

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nutrition</h1>
            <p className="text-gray-600 mt-2">Track your meals and nutrition goals</p>
          </div>
          <Link
            href="/dashboard/nutrition/new"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Log Meal
          </Link>
        </div>

        <MealList meals={meals} />
      </div>
    </div>
  )
}
