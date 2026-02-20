import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { getTop3CardsForPurchase } from "@/lib/finance/card-utils"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cards = await getTop3CardsForPurchase(session.user.id)

    return NextResponse.json({ cards })
  } catch (error) {
    console.error("Error fetching card recommendations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
