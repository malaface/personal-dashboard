import { Suspense } from "react"
import { Metadata } from "next"
import ResetPasswordForm from "./ResetPasswordForm"

export const metadata: Metadata = {
  title: "Restablecer Contraseña | Dashboard Personal",
  description: "Establece tu nueva contraseña",
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nueva Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ingresa tu nueva contraseña
          </p>
        </div>
        <Suspense fallback={<div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-700 rounded-md" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
