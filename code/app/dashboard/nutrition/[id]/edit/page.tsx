import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import MealForm from "@/components/nutrition/MealForm"

interface EditMealPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditMealPage({ params }: EditMealPageProps) {
  const user = await requireAuth()
  const { id } = await params

  const meal = await prisma.meal.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      foodItems: true,
    },
  })

  if (!meal) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/nutrition"
            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm"
          >
            ← Volver a Nutrición
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Editar Comida</h1>

        <MealForm meal={meal} />
      </div>
    </div>
  )
}
