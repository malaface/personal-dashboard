import { Metadata } from "next"
import RegisterForm from "@/components/auth/RegisterForm"

export const metadata: Metadata = {
  title: "Register | Personal Dashboard",
  description: "Create your personal dashboard account",
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign up for a new account
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
