import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { habits, journals } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ journalId: string; habitId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { journalId, habitId } = await params;
  const { color } = await request.json();

  const journal = await db
    .select({ id: journals.id })
    .from(journals)
    .where(and(eq(journals.id, journalId), eq(journals.userId, session.user.id)));
  if (!journal[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db
    .update(habits)
    .set({ color })
    .where(and(eq(habits.id, habitId), eq(habits.journalId, journalId)));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
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

  await db.delete(habits).where(
    and(eq(habits.id, habitId), eq(habits.journalId, journalId))
  );

  return NextResponse.json({ ok: true });
}
