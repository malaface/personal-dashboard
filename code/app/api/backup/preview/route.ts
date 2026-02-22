/**
 * POST /api/backup/preview
 * Preview backup file before importing
 *
 * Body: JSON backup data
 * Response: { valid, counts, warnings, errors }
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { previewImport } from "@/lib/backup/import"
import { MAX_BACKUP_SIZE } from "@/lib/backup/types"

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    // Check content length
    const contentLength = request.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > MAX_BACKUP_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_BACKUP_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      )
    }

    // Parse JSON body
    let backupData: unknown
    try {
      backupData = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      )
    }

    // Preview import
    const preview = await previewImport(backupData)

    return NextResponse.json(preview)
  } catch (error: any) {
    console.error("POST /api/backup/preview error:", error)

    if (error.message === "Unauthorized" || error.digest?.includes("NEXT_REDIRECT")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
