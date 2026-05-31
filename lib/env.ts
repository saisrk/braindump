/**
 * Environment variable validation.
 *
 * This module provides access to required environment variables,
 * validating them only when accessed (to support build-time operations).
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

// Use lazy getters to defer validation until actually needed
export const env = {
  get DATABASE_URL(): string {
    return requireEnv('DATABASE_URL');
  },
  get AUTH_SECRET(): string {
    return requireEnv('AUTH_SECRET');
  },
};
