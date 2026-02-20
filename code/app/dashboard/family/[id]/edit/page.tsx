import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import FamilyMemberForm from "@/components/family/FamilyMemberForm"

interface EditFamilyMemberPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditFamilyMemberPage({ params }: EditFamilyMemberPageProps) {
  const user = await requireAuth()
  const { id } = await params

  const member = await prisma.familyMember.findFirst({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!member) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/family"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm"
          >
            ← Volver a Familia
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Editar Miembro de Familia</h1>

        <FamilyMemberForm member={member} />
      </div>
    </div>
  )
}
