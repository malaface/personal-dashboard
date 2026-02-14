import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cards = await prisma.creditCard.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        creditLimit: true,
        currentBalance: true,
        cutoffDay: true,
        paymentDay: true,
        color: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    })

    return NextResponse.json({ cards })
  } catch (error) {
    console.error("Error fetching cards list:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
