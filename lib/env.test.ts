import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('lib/env', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('exports env object when all variables are set', async () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
    process.env.AUTH_SECRET = 'test-secret-value';

    const { env } = await import('./env');

    expect(env.DATABASE_URL).toBe('postgresql://localhost:5432/test');
    expect(env.AUTH_SECRET).toBe('test-secret-value');
  });

  it('throws when DATABASE_URL is missing', async () => {
    process.env.AUTH_SECRET = 'test-secret-value';
    delete process.env.DATABASE_URL;

    await expect(() => import('./env')).rejects.toThrow(
      'Missing required environment variable: DATABASE_URL'
    );
  });

  it('throws when AUTH_SECRET is missing', async () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
    delete process.env.AUTH_SECRET;

    await expect(() => import('./env')).rejects.toThrow(
      'Missing required environment variable: AUTH_SECRET'
    );
  });

  it('throws with a message referencing .env.example', async () => {
    delete process.env.DATABASE_URL;
    delete process.env.AUTH_SECRET;

    await expect(() => import('./env')).rejects.toThrow(
      'Check .env.example for required variables.'
    );
  });

  it('treats empty string as missing', async () => {
    process.env.DATABASE_URL = '';
    process.env.AUTH_SECRET = 'test-secret-value';

    await expect(() => import('./env')).rejects.toThrow(
      'Missing required environment variable: DATABASE_URL'
    );
  });
});
