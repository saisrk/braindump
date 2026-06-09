import 'server-only';
import { db } from '@/db';
import { expressResults } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export interface ExpressHistoryItem {
  id: string;
  format: string;
  audience: string | null;
  scopeLabel: string | null;
  usedCount: number;
  output: Record<string, unknown>;
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
    scopeLabel: r.scopeLabel,
    usedCount: r.usedCount,
    output: r.output as Record<string, unknown>,
    createdAt: r.createdAt,
  }));
}
