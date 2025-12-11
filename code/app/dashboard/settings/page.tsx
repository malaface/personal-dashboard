import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import ProfileForm from "@/components/settings/ProfileForm"
import PasswordForm from "@/components/settings/PasswordForm"

export default async function SettingsPage() {
  const user = await requireAuth()

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  })

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-8">
          <ProfileForm user={user} profile={profile} />
          <PasswordForm />
        </div>
      </div>
    </div>
  )
}
