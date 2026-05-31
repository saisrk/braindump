import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '@/lib/env';

let _db: any = null;

try {
  const url = env.DATABASE_URL;
  // Only connect if we have a real URL (not a placeholder)
  if (url && !url.includes('_not_set_at_build_time')) {
    const client = postgres(url);
    _db = drizzle(client, { schema });
  }
} catch (err) {
  console.warn('[db] Failed to initialize during build:', err instanceof Error ? err.message : String(err));
}

// Export a dummy object if db is not initialized, or the real db
export const db = _db || ({} as any);
