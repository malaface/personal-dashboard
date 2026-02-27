import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import CreditCardList from "@/components/finance/cards/CreditCardList"
import FloatingActionButton from "@/components/ui/FloatingActionButton"
import Top3CardsWidget from "@/components/finance/cards/Top3CardsWidget"
import FinanceModeTabs from "@/components/finance/FinanceModeTabs"

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tarjetas de Credito</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Administra tus tarjetas y ve cuando conviene comprar</p>
        </div>

        <FinanceModeTabs cardCount={cards.length} />

        {cards.length > 0 && (
          <div className="mb-6">
            <Top3CardsWidget />
          </div>
        )}

        <CreditCardList cards={cards} />

        {/* FAB */}
        <FloatingActionButton href="/dashboard/finance/cards/new" title="Nueva Tarjeta" />
      </div>
    </div>
  )
}
