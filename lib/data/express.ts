import 'server-only';
import { db } from '@/db';
import { expressResults } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { ExpressResult } from '@/lib/ai/express';

export interface ExpressHistoryItem {
  id: string;
  format: string;
  audience: string | null;
  topicFilter: string | null;
  sinceFilter: string | null;
  usedCount: number;
  output: ExpressResult;
  createdAt: Date;
}

export async function getExpressHistory(userId: string, limit = 20): Promise<ExpressHistoryItem[]> {
  const rows = await db
    .select()
    .from(expressResults)
    .where(eq(expressResults.userId, userId))
    .orderBy(desc(expressResults.createdAt))
    .limit(limit);

  return rows.map((r: typeof expressResults.$inferSelect) => ({
    id: r.id,
    format: r.format,
    audience: r.audience,
    topicFilter: r.topicFilter,
    sinceFilter: r.sinceFilter,
    usedCount: r.usedCount,
    output: r.output as ExpressResult,
    createdAt: r.createdAt,
  }));
}
