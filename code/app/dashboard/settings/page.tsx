import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import ProfileForm from "@/components/settings/ProfileForm"
import PasswordForm from "@/components/settings/PasswordForm"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import Link from "next/link"
import { SparklesIcon, FolderIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

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
          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Configuración Avanzada
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              <Link
                href="/dashboard/settings/ai-credentials"
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Credenciales de AI
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Gestiona tus API keys
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition" />
              </Link>

              <Link
                href="/dashboard/settings/categories"
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <FolderIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Categorías
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Organiza transacciones
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition" />
              </Link>
            </div>
          </div>

          <ThemeToggle />
          <ProfileForm user={user} profile={profile} />
          <PasswordForm />
        </div>
      </div>
    </div>
  )
}
