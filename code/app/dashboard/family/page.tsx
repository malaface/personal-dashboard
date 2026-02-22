import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import FamilyDashboard from "@/components/family/FamilyDashboard"

export default async function FamilyPage() {
  const user = await requireAuth()

  const [members, events] = await Promise.all([
    prisma.familyMember.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      where: { userId: user.id },
      include: {
        familyMember: { select: { name: true } },
      },
      orderBy: { date: "asc" },
    }),
  ])

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CRM Familiar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra relaciones, eventos y fechas importantes
          </p>
        </div>

        <FamilyDashboard members={members} events={events} />
      </div>
    </div>
  )
}
