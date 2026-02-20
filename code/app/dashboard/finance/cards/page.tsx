import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import Link from "next/link"
import CreditCardList from "@/components/finance/cards/CreditCardList"
import Top3CardsWidget from "@/components/finance/cards/Top3CardsWidget"

export default async function CardsPage() {
  const user = await requireAuth()

  const cards = await prisma.creditCard.findMany({
    where: {
      userId: user.id,
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tarjetas de Credito</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Administra tus tarjetas y ve cuando conviene comprar</p>
          </div>
          <Link
            href="/dashboard/finance"
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Volver
          </Link>
        </div>

        {cards.length > 0 && (
          <div className="mb-6">
            <Top3CardsWidget />
          </div>
        )}

        <CreditCardList cards={cards} />

        {/* FAB */}
        <Link
          href="/dashboard/finance/cards/new"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Nueva Tarjeta"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
