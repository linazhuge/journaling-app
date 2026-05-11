import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { habitLogs, journals } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ journalId: string; habitId: string; date: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { journalId, habitId, date } = await params;

  const journal = await db
    .select({ id: journals.id })
    .from(journals)
    .where(and(eq(journals.id, journalId), eq(journals.userId, session.user.id)));
  if (!journal[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db
    .delete(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, date)));

  return NextResponse.json({ ok: true });
}
