import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app';
import { disconnectDatabase } from '../src/config/database';
import { disconnectRedis } from '../src/config/redis';

describe('Express Application and Health Route', () => {
  const app = createApp();

  after(async () => {
    await disconnectDatabase();
    await disconnectRedis();
  });

  it('should initialize express app successfully', () => {
    assert.ok(app);
  });

  it('should respond to GET /api/v1/health with health schema', async () => {
    const res = await request(app).get('/api/v1/health');
    // Status can be 200 (if docker services running) or 503 (if services not running locally in test environment)
    assert.ok(res.status === 200 || res.status === 503);
    assert.equal(res.body.service, 'sadagati-backend');
    assert.ok(res.body.status === 'ok' || res.body.status === 'degraded');
    assert.ok(res.body.checks);
    assert.ok(typeof res.body.checks.database === 'string');
    assert.ok(typeof res.body.checks.redis === 'string');
  });

  it('should return 404 for unknown route', async () => {
    const res = await request(app).get('/api/v1/unknown-endpoint');
    assert.equal(res.status, 404);
    assert.equal(res.body.status, 'error');
    assert.match(res.body.message, /Route not found/);
  });
});
