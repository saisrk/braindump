import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/session';
import { db } from '@/db';
import { learnings } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const userId = await requireUserId();
    const [row] = await db
      .select({ status: learnings.status })
      .from(learnings)
      .where(and(eq(learnings.id, id), eq(learnings.userId, userId)));

    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ status: row.status });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
