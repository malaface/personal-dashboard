import { requireAuth } from "@/lib/auth/utils"
import DashboardShell from "@/components/dashboard/DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  return (
    <div className="flex h-dvh bg-gray-50 dark:bg-gray-900">
      <DashboardShell user={user}>
        {children}
      </DashboardShell>
    </div>
  )
}
