import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'unknown', latency: 0 },
      redis: { status: 'unknown', latency: 0 },
    },
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.1.0',
  };

  try {
    // Database health check
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    health.status = 'unhealthy';
    health.checks.database = {
      status: 'unhealthy',
      latency: Date.now() - startTime,
    };
  }

  // Redis health check (optional)
  if (process.env.REDIS_URL) {
    try {
      const redisStart = Date.now();
      // Si en el futuro se implementa Redis, aquí iría el ping
      // const redis = new Redis(process.env.REDIS_URL);
      // await redis.ping();
      health.checks.redis = {
        status: 'configured_but_not_checked',
        latency: Date.now() - redisStart,
      };
    } catch (error) {
      console.error('Redis health check failed:', error);
      health.status = 'degraded';
      health.checks.redis = {
        status: 'unhealthy',
        latency: 0,
      };
    }
  } else {
    health.checks.redis = {
      status: 'not_configured',
      latency: 0,
    };
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
