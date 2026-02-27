"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface FinanceModeTabsProps {
  accountCount?: number
  cardCount?: number
}

const tabs = [
  { href: "/dashboard/finance", label: "Transacciones" },
  { href: "/dashboard/finance/accounts", label: "Cuentas", countKey: "accountCount" as const },
  { href: "/dashboard/finance/cards", label: "Tarjetas", countKey: "cardCount" as const },
  { href: "/dashboard/finance/progress", label: "Progreso" },
]

export default function FinanceModeTabs({ accountCount, cardCount }: FinanceModeTabsProps) {
  const pathname = usePathname()

  const counts: Record<string, number | undefined> = { accountCount, cardCount }

  return (
    <div className="flex overflow-x-auto scrollbar-hide gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
      {tabs.map((tab) => {
        const isActive = tab.href === "/dashboard/finance"
          ? pathname === "/dashboard/finance"
          : pathname.startsWith(tab.href)
        const count = tab.countKey ? counts[tab.countKey] : undefined

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
            {count !== undefined && count > 0 && (
              <span className="text-xs opacity-60 ml-1">({count})</span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
