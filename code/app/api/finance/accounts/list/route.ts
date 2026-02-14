import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accounts = await prisma.financialAccount.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      select: {
        id: true,
        accountType: true,
        name: true,
        balance: true,
        currency: true,
        icon: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Error fetching accounts list:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
