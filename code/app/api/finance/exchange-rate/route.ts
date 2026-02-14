/**
 * GET /api/finance/exchange-rate
 * Returns current USD to MXN exchange rate
 */

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { getUSDtoMXNRate } from "@/lib/finance/exchange-rate"

export async function GET() {
  try {
    await requireAuth()

    const rate = await getUSDtoMXNRate()

    return NextResponse.json({ rate, currency: "MXN", base: "USD" })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : ""
    if (
      message === "Unauthorized" ||
      (error as { digest?: string })?.digest?.includes("NEXT_REDIRECT")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
