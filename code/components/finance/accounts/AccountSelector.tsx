"use client"

interface Account {
  id: string
  accountType: string
  name: string
  balance: number
  currency: string
  icon?: string | null
}

const ACCOUNT_TYPE_ICONS: Record<string, string> = {
  DEBIT_CARD: "💳",
  CASH: "💵",
  SAVINGS: "🏦",
}

interface AccountSelectorProps {
  accounts: Account[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

export default function AccountSelector({
  accounts,
  value,
  onChange,
  placeholder = "Seleccionar cuenta",
  disabled = false,
  required = false,
}: AccountSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
    >
      <option value="">{placeholder}</option>
      {accounts.map((account) => (
        <option key={account.id} value={account.id}>
          {account.icon || ACCOUNT_TYPE_ICONS[account.accountType] || "💳"} {account.name} - ${account.balance.toLocaleString("es-MX", { minimumFractionDigits: 2 })} {account.currency}
        </option>
      ))}
    </select>
  )
}
