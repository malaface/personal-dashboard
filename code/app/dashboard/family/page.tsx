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
            <h1 className="text-3xl font-bold text-gray-900">Family CRM</h1>
            <p className="text-gray-600 mt-2">
              Manage family members, events, and time logs
            </p>
          </div>
          <Link
            href="/dashboard/family/new"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Add Family Member
          </Link>
        </div>

        <FamilyMemberList members={members} />
      </div>
    </div>
  )
}
