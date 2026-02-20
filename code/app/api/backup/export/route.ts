/**
 * GET /api/backup/export
 * Export user data as JSON backup
 *
 * Query params:
 *   - modules: comma-separated list (optional, default: all)
 *     Example: ?modules=workouts,finance
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { exportUserData, getExportCounts } from "@/lib/backup/export"
import { createAuditLog } from "@/lib/audit/logger"
import type { BackupModule } from "@/lib/backup/types"
import { ALL_MODULES } from "@/lib/backup/types"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams

    // Parse modules parameter
    const modulesParam = searchParams.get("modules")
    let modules: BackupModule[] | undefined

    if (modulesParam) {
      const requestedModules = modulesParam.split(",").map(m => m.trim()) as BackupModule[]

      // Validate modules
      const invalidModules = requestedModules.filter(m => !ALL_MODULES.includes(m))
      if (invalidModules.length > 0) {
        return NextResponse.json(
          { error: `Invalid modules: ${invalidModules.join(", ")}` },
          { status: 400 }
        )
      }

      modules = requestedModules
    }

    // Get counts for audit logging
    const counts = await getExportCounts(user.id)

    // Export data
    const backup = await exportUserData(user.id, user.email!, modules)

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: "DATA_EXPORTED",
      metadata: {
        modules: modules || ALL_MODULES,
        counts,
      },
    })

    // Format filename with date
    const date = new Date().toISOString().split("T")[0]
    const filename = `dashboard_backup_${date}.json`

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error: any) {
    console.error("GET /api/backup/export error:", error)

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
