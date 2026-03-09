interface TransactionTypeBadgeProps {
  type: string
}

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  SWAP: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", label: "Swap" },
  LP_ADD: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", label: "LP Add" },
  LP_REMOVE: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", label: "LP Remove" },
  TRANSFER_IN: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", label: "Transfer In" },
  TRANSFER_OUT: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", label: "Transfer Out" },
  APPROVAL: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", label: "Approval" },
  BRIDGE: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300", label: "Bridge" },
  UNKNOWN: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", label: "Unknown" },
}

export default function TransactionTypeBadge({ type }: TransactionTypeBadgeProps) {
  const style = TYPE_STYLES[type] || TYPE_STYLES.UNKNOWN

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  )
}
