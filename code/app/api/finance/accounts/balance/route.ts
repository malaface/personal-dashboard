import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { calculateTotalBalance } from "@/lib/finance/account-utils"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const balance = await calculateTotalBalance(session.user.id)

    return NextResponse.json(balance)
  } catch (error) {
    console.error("Error fetching account balance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
