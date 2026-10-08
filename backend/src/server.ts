import http from 'http';
import { app } from './app';
import { getEnv } from './config/env';
import { disconnectDatabase } from './config/database';
import { disconnectRedis } from './config/redis';

let server: http.Server | null = null;
let isShuttingDown = false;

export function startServer(): http.Server {
  if (server) {
    return server;
  }

  const env = getEnv();
  server = app.listen(env.PORT, () => {
    console.log(`[Sadagati MicroFinance API] listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  const handleShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

    if (server) {
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await disconnectDatabase();
          console.log('Database disconnected.');
          await disconnectRedis();
          console.log('Redis disconnected.');
        } catch (err) {
          console.error('Error during cleanup:', err);
        } finally {
          process.exit(0);
        }
      });

      // Force terminate after 10s timeout if connections remain open
      setTimeout(() => {
        console.error('Graceful shutdown timed out, forcing exit.');
        process.exit(1);
      }, 10000).unref();
    }
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
