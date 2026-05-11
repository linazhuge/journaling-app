import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { journals } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

async function getOwnedJournal(journalId: string, userId: string) {
  const rows = await db
    .select()
    .from(journals)
    .where(and(eq(journals.id, journalId), eq(journals.userId, userId)));
  return rows[0] ?? null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ journalId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { journalId } = await params;
  const journal = await getOwnedJournal(journalId, session.user.id);
  if (!journal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(journal);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ journalId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { journalId } = await params;
  const journal = await getOwnedJournal(journalId, session.user.id);
  if (!journal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const { name, coverColor } = body as { name?: string; coverColor?: string };

  const updates: Partial<typeof journal> = {};
  if (name?.trim()) updates.name = name.trim();
  if (coverColor) updates.coverColor = coverColor;

  if (Object.keys(updates).length === 0) return NextResponse.json(journal);

  await db.update(journals).set(updates).where(eq(journals.id, journalId));
  const rows = await db.select().from(journals).where(eq(journals.id, journalId));
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ journalId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { journalId } = await params;
  const journal = await getOwnedJournal(journalId, session.user.id);
  if (!journal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.delete(journals).where(eq(journals.id, journalId));
  return NextResponse.json({ success: true });
}
