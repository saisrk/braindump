/**
 * Environment variable validation.
 *
 * This module validates required environment variables at import time,
 * causing a clear startup failure if any are missing.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Check .env.example for required variables.`
    );
  }
  return value;
}

export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  AUTH_SECRET: requireEnv('AUTH_SECRET'),
};
