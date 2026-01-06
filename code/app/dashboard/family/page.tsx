import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import Link from "next/link"
import FamilyMemberList from "@/components/family/FamilyMemberList"

export default async function FamilyPage() {
  const user = await requireAuth()

  const members = await prisma.familyMember.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CRM Familiar</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Administra miembros de familia, eventos y registros de tiempo
            </p>
          </div>
          <Link
            href="/dashboard/family/new"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Agregar Miembro
          </Link>
        </div>

        <FamilyMemberList members={members} />
      </div>
    </div>
  )
}
