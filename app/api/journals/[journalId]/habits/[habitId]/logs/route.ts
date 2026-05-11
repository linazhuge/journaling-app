import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { habitLogs, journals } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ journalId: string; habitId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { journalId, habitId } = await params;

  const journal = await db
    .select({ id: journals.id })
    .from(journals)
    .where(and(eq(journals.id, journalId), eq(journals.userId, session.user.id)));
  if (!journal[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { date } = (await request.json()) as { date: string };
  if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 });

  await db.insert(habitLogs).values({ id: nanoid(), habitId, date }).onConflictDoNothing();

  return NextResponse.json({ ok: true }, { status: 201 });
}
