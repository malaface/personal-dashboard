import { requireAuth } from "@/lib/auth/utils"
import Link from "next/link"
import FamilyMemberForm from "@/components/family/FamilyMemberForm"

export default async function NewFamilyMemberPage() {
  await requireAuth()

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

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Agregar Miembro de Familia</h1>

        <FamilyMemberForm />
      </div>
    </div>
  )
}
