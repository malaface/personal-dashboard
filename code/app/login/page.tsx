import { Suspense } from "react"
import { Metadata } from "next"
import LoginForm from "@/components/auth/LoginForm"

export const metadata: Metadata = {
  title: "Iniciar Sesión | Dashboard Personal",
  description: "Inicia sesión en tu dashboard personal",
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { verified?: string; error?: string; message?: string }
}) {
  const verified = searchParams.verified === 'true'
  const error = searchParams.error
  const message = searchParams.message ? decodeURIComponent(searchParams.message) : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Personal
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Success Message (Email Verified) */}
        {verified && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-md">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">
                {message || "¡Email verificado exitosamente! Ya puedes iniciar sesión."}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">
                {message || "Ocurrió un error. Por favor intenta de nuevo."}
              </span>
            </div>
          </div>
        )}

        <Suspense fallback={<div className="animate-pulse h-64 bg-gray-100 dark:bg-gray-700 rounded-md" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
