import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import TransactionForm from "@/components/finance/TransactionForm"

interface EditTransactionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
  const user = await requireAuth()
  const { id } = await params

  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!transaction) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/finance"
            className="text-green-600 hover:text-green-700 text-sm"
          >
            ← Back to Finance
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Transaction</h1>

        <TransactionForm transaction={transaction} />
      </div>
    </div>
  )
}
