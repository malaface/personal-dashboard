import { prisma } from "@/lib/db/prisma"
import { headers } from "next/headers"

/**
 * Audit action types
 */
export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "REGISTER"
  | "PASSWORD_CHANGE"
  | "EMAIL_VERIFIED"
  // Gym Module
  | "WORKOUT_CREATED"
  | "WORKOUT_UPDATED"
  | "WORKOUT_DELETED"
  | "EXERCISE_CREATED"
  | "EXERCISE_UPDATED"
  | "EXERCISE_DELETED"
  // Finance Module
  | "TRANSACTION_CREATED"
  | "TRANSACTION_UPDATED"
  | "TRANSACTION_DELETED"
  | "INVESTMENT_CREATED"
  | "INVESTMENT_UPDATED"
  | "INVESTMENT_DELETED"
  | "BUDGET_CREATED"
  | "BUDGET_UPDATED"
  | "BUDGET_DELETED"
  // Nutrition Module
  | "MEAL_CREATED"
  | "MEAL_UPDATED"
  | "MEAL_DELETED"
  // Family Module
  | "FAMILY_MEMBER_CREATED"
  | "FAMILY_MEMBER_UPDATED"
  | "FAMILY_MEMBER_DELETED"
  // Backup Operations
  | "DATA_EXPORTED"
  | "DATA_IMPORTED"

interface AuditLogData {
  userId?: string
  action: AuditAction
  metadata?: Record<string, any>
}

/**
 * Create an audit log entry
 *
 * This function captures security and user activity events with:
 * - User ID (if authenticated)
 * - Action type
 * - IP address
 * - User agent
 * - Custom metadata
 *
 * Failures to log are caught and logged to console but don't break app flow.
 */
export async function createAuditLog({ userId, action, metadata }: AuditLogData) {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") ||
                      headersList.get("x-real-ip") ||
                      headersList.get("cf-connecting-ip") || // Cloudflare
                      null
    const userAgent = headersList.get("user-agent") || null

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress,
        userAgent,
        metadata: metadata || {},
      },
    })

    // Log to console for immediate visibility
    const logPrefix = userId ? `[AUDIT:${userId.substring(0, 8)}]` : '[AUDIT:ANON]'
    console.log(`${logPrefix} ${action}`, {
      ipAddress: ipAddress?.substring(0, 15) + '...',
      metadata
    })
  } catch (error) {
    console.error("❌ Failed to create audit log:", error)
    // Don't throw - audit logging shouldn't break app flow
    // But we should monitor these errors in production
  }
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(userId: string, limit: number = 50) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      action: true,
      ipAddress: true,
      userAgent: true,
      metadata: true,
      createdAt: true,
    },
  })
}

/**
 * Get recent failed login attempts
 * Useful for detecting brute force attacks
 */
export async function getRecentFailedLogins(limit: number = 100) {
  return prisma.auditLog.findMany({
    where: {
      action: 'LOGIN_FAILED',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      userId: true,
      ipAddress: true,
      userAgent: true,
      metadata: true,
      createdAt: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })
}

/**
 * Get failed login attempts for a specific IP address
 * Used for rate limiting and blocking
 */
export async function getFailedLoginsByIP(ipAddress: string, timeWindowMinutes: number = 15) {
  return prisma.auditLog.count({
    where: {
      action: 'LOGIN_FAILED',
      ipAddress,
      createdAt: {
        gte: new Date(Date.now() - timeWindowMinutes * 60 * 1000),
      },
    },
  })
}

/**
 * Get all audit logs with pagination (admin only)
 */
export async function getAllAuditLogs(page: number = 1, limit: number = 100) {
  const skip = (page - 1) * limit

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.auditLog.count(),
  ])

  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + logs.length < total,
  }
}

/**
 * Get audit log statistics
 */
export async function getAuditLogStats() {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalLogs,
    logsLast24h,
    logsLast7d,
    failedLoginsLast24h,
    uniqueUsersLast24h,
  ] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({ where: { createdAt: { gte: last24Hours } } }),
    prisma.auditLog.count({ where: { createdAt: { gte: last7Days } } }),
    prisma.auditLog.count({
      where: {
        action: 'LOGIN_FAILED',
        createdAt: { gte: last24Hours },
      },
    }),
    prisma.auditLog.findMany({
      where: {
        userId: { not: null },
        createdAt: { gte: last24Hours },
      },
      select: { userId: true },
      distinct: ['userId'],
    }).then(logs => logs.length),
  ])

  return {
    totalLogs,
    logsLast24h,
    logsLast7d,
    failedLoginsLast24h,
    uniqueUsersLast24h,
  }
}
