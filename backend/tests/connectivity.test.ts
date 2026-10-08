import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { checkDatabaseHealth, disconnectDatabase } from '../src/config/database';
import { checkRedisHealth, disconnectRedis } from '../src/config/redis';

describe('Dependency Connectivity Checks', () => {
  after(async () => {
    await disconnectDatabase();
    await disconnectRedis();
  });

  it('checkDatabaseHealth returns boolean without throwing unhandled exceptions', async () => {
    const isHealthy = await checkDatabaseHealth();
    assert.equal(typeof isHealthy, 'boolean');
  });

  it('checkRedisHealth returns boolean without throwing unhandled exceptions', async () => {
    const isHealthy = await checkRedisHealth();
    assert.equal(typeof isHealthy, 'boolean');
  });
});
