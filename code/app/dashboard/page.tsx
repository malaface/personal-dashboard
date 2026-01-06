import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await requireAuth()

  // Get basic stats
  const [workoutCount, transactionCount, mealCount, familyMemberCount] = await Promise.all([
    prisma.workout.count({ where: { userId: user.id } }),
    prisma.transaction.count({ where: { userId: user.id } }),
    prisma.meal.count({ where: { userId: user.id } }),
    prisma.familyMember.count({ where: { userId: user.id } }),
  ])

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Resumen del Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Aquí está un resumen de tus actividades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Entrenamientos"
            count={workoutCount}
            icon="💪"
            color="bg-blue-500"
            href="/dashboard/workouts"
          />
          <StatsCard
            title="Transacciones"
            count={transactionCount}
            icon="💰"
            color="bg-green-500"
            href="/dashboard/finance"
          />
          <StatsCard
            title="Comidas"
            count={mealCount}
            icon="🍽️"
            color="bg-orange-500"
            href="/dashboard/nutrition"
          />
          <StatsCard
            title="Miembros de Familia"
            count={familyMemberCount}
            icon="👨‍👩‍👧‍👦"
            color="bg-purple-500"
            href="/dashboard/family"
          />
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold dark:text-white mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton href="/dashboard/workouts" label="Registrar Entrenamiento" />
            <QuickActionButton href="/dashboard/finance" label="Agregar Transacción" />
            <QuickActionButton href="/dashboard/nutrition" label="Registrar Comida" />
            <QuickActionButton href="/dashboard/family" label="Administrar Familia" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsCard({
  title,
  count,
  icon,
  color,
  href,
}: {
  title: string
  count: number
  icon: string
  color: string
  href: string
}) {
  return (
    <Link href={href} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
          <p className="text-3xl font-bold dark:text-white mt-2">{count}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </Link>
  )
}

function QuickActionButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-center font-medium transition"
    >
      {label}
    </Link>
  )
}
