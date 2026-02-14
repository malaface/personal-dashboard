import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"
import CreditCardForm from "@/components/finance/cards/CreditCardForm"
import Link from "next/link"

export default async function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const { id } = await params

  const card = await prisma.creditCard.findFirst({
    where: { id, userId: user.id },
  })

  if (!card) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Tarjeta</h1>
          <Link
            href="/dashboard/finance/cards"
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Cancelar
          </Link>
        </div>
        <CreditCardForm card={card} />
      </div>
    </div>
  )
}
