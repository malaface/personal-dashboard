import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/config"

export default async function Home() {
  const session = await auth()

  // If user is authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard")
  }

  // If not authenticated, redirect to login
  redirect("/login")
}
