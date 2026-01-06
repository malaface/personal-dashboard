import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import ProfileForm from "@/components/settings/ProfileForm"
import PasswordForm from "@/components/settings/PasswordForm"
import { ThemeToggle } from "@/components/theme/ThemeToggle"

export default async function SettingsPage() {
  const user = await requireAuth()

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  })

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ajustes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Administra la configuración de tu cuenta y preferencias</p>
        </div>

        <div className="space-y-8">
          <ThemeToggle />
          <ProfileForm user={user} profile={profile} />
          <PasswordForm />
        </div>
      </div>
    </div>
  )
}
