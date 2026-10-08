import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateEnv } from '../src/config/env';

describe('Environment Configuration Validation', () => {
  it('should accept valid environment variables', () => {
    const validConfig = {
      NODE_ENV: 'test',
      PORT: '5001',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
      REDIS_URL: 'redis://localhost:6379',
    };

    const parsed = validateEnv(validConfig);
    assert.equal(parsed.NODE_ENV, 'test');
    assert.equal(parsed.PORT, 5001);
    assert.equal(parsed.DATABASE_URL, 'postgresql://test:test@localhost:5432/test_db');
    assert.equal(parsed.REDIS_URL, 'redis://localhost:6379');
  });

  it('should reject configuration when DATABASE_URL is missing', () => {
    const invalidConfig = {
      NODE_ENV: 'test',
      PORT: '5001',
      REDIS_URL: 'redis://localhost:6379',
    };

    assert.throws(
      () => validateEnv(invalidConfig),
      /DATABASE_URL/
    );
  });

  it('should reject configuration when REDIS_URL is missing', () => {
    const invalidConfig = {
      NODE_ENV: 'test',
      PORT: '5001',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
    };

    assert.throws(
      () => validateEnv(invalidConfig),
      /REDIS_URL/
    );
  });

  it('should reject configuration with invalid PORT', () => {
    const invalidConfig = {
      PORT: 'not-a-port',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
      REDIS_URL: 'redis://localhost:6379',
    };

    assert.throws(
      () => validateEnv(invalidConfig)
    );
  });
});
