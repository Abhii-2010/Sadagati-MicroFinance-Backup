import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../config/database';
import { checkRedisHealth } from '../config/redis';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  const [isDbHealthy, isRedisHealthy] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
  ]);

  const allHealthy = isDbHealthy && isRedisHealthy;
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: allHealthy ? 'ok' : 'degraded',
    service: 'sadagati-backend',
    timestamp: new Date().toISOString(),
    checks: {
      database: isDbHealthy ? 'ok' : 'error',
      redis: isRedisHealthy ? 'ok' : 'error',
    },
  });
}
