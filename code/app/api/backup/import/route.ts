/**
 * POST /api/backup/import
 * Import backup data into user's account
 *
 * Body: { data: BackupExport, mode?: "merge" | "replace" }
 *   - mode: "merge" (default) - adds data without deleting existing
 *   - mode: "replace" - deletes existing data first
 *
 * Response: { success, imported, skipped, errors }
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { importUserData, previewImport } from "@/lib/backup/import"
import { createAuditLog } from "@/lib/audit/logger"
import { MAX_BACKUP_SIZE, type ImportMode } from "@/lib/backup/types"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Check content length
    const contentLength = request.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > MAX_BACKUP_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_BACKUP_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      )
    }

    // Parse JSON body
    let body: { data: unknown; mode?: ImportMode }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      )
    }

    const { data: backupData, mode = "merge" } = body

    if (!backupData) {
      return NextResponse.json(
        { error: "Missing backup data" },
        { status: 400 }
      )
    }

    // Validate mode
    if (mode !== "merge" && mode !== "replace") {
      return NextResponse.json(
        { error: "Invalid mode. Must be 'merge' or 'replace'" },
        { status: 400 }
      )
    }

    // Preview first to validate
    const preview = await previewImport(backupData)

    if (!preview.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid backup format",
          details: preview.errors,
        },
        { status: 400 }
      )
    }

    // Perform import
    const result = await importUserData(user.id, backupData, mode)

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: "DATA_IMPORTED",
      metadata: {
        mode,
        sourceEmail: preview.sourceEmail,
        sourceVersion: preview.version,
        imported: result.imported,
        skipped: result.skipped,
        success: result.success,
      },
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Import failed",
          details: result.errors,
          imported: result.imported,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Backup imported successfully",
      imported: result.imported,
      skipped: result.skipped,
      warnings: preview.warnings,
    })
  } catch (error: any) {
    console.error("POST /api/backup/import error:", error)

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
