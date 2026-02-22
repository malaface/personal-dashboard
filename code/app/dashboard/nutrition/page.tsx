import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import Link from "next/link"
import MealList from "@/components/nutrition/MealList"
import FloatingActionButton from "@/components/ui/FloatingActionButton"

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nutrición</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Rastrea tus comidas y objetivos nutricionales</p>
          </div>
          <Link
            href="/dashboard/nutrition/progress"
            className="px-4 py-2 border border-orange-600 text-orange-600 dark:text-orange-400 dark:border-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
          >
            Ver Progreso
          </Link>
        </div>

        <MealList meals={meals} />

        {/* FAB */}
        <FloatingActionButton href="/dashboard/nutrition/new" title="Registrar Comida" color="bg-orange-600 hover:bg-orange-700" />
      </div>
    </div>
  )
}
