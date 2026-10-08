import Redis from 'ioredis';
import { getEnv } from './env';

let redisInstance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisInstance) {
    const env = getEnv();
    redisInstance = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 100, 1000);
      },
    });

    redisInstance.on('error', (err) => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Redis client error:', err.message);
      }
    });
  }
  return redisInstance;
}

export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (client.status !== 'ready' && client.status !== 'connecting') {
      await client.connect();
    }
    const pong = await client.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisInstance) {
    try {
      await redisInstance.quit();
    } catch {
      redisInstance.disconnect();
    } finally {
      redisInstance = null;
    }
  }
}
