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
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Here's a summary of your activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Workouts"
            count={workoutCount}
            icon="💪"
            color="bg-blue-500"
            href="/dashboard/workouts"
          />
          <StatsCard
            title="Transactions"
            count={transactionCount}
            icon="💰"
            color="bg-green-500"
            href="/dashboard/finance"
          />
          <StatsCard
            title="Meals"
            count={mealCount}
            icon="🍽️"
            color="bg-orange-500"
            href="/dashboard/nutrition"
          />
          <StatsCard
            title="Family Members"
            count={familyMemberCount}
            icon="👨‍👩‍👧‍👦"
            color="bg-purple-500"
            href="/dashboard/family"
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton href="/dashboard/workouts" label="Log Workout" />
            <QuickActionButton href="/dashboard/finance" label="Add Transaction" />
            <QuickActionButton href="/dashboard/nutrition" label="Log Meal" />
            <QuickActionButton href="/dashboard/family" label="Manage Family" />
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
    <Link href={href} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{count}</p>
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
      className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-center font-medium transition"
    >
      {label}
    </Link>
  )
}
