import { requireAuth } from "@/lib/auth/utils"
import AICredentialsManager from "@/components/settings/AICredentialsManager"

export default async function AICredentialsPage() {
  const user = await requireAuth()

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Credenciales de AI
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestiona tus claves de API para servicios de inteligencia artificial.
            Estas credenciales se utilizan para generar insights personalizados en cada módulo.
          </p>
        </div>

        <AICredentialsManager userId={user.id} />
      </div>
    </div>
  )
}
