import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { journals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ journalId: string }> }
) {
  const { journalId } = await params;
  const db = getDb();
  const journal = db.select().from(journals).where(eq(journals.id, journalId)).get();
  if (!journal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(journal);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ journalId: string }> }
) {
  const { journalId } = await params;
  const body = await request.json();
  const { name, coverColor } = body as { name?: string; coverColor?: string };

  const db = getDb();
  const journal = db.select().from(journals).where(eq(journals.id, journalId)).get();
  if (!journal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updates: Partial<typeof journal> = {};
  if (name?.trim()) updates.name = name.trim();
  if (coverColor) updates.coverColor = coverColor;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(journal);
  }

  db.update(journals).set(updates).where(eq(journals.id, journalId)).run();
  const updated = db.select().from(journals).where(eq(journals.id, journalId)).get();
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ journalId: string }> }
) {
  const { journalId } = await params;
  const db = getDb();
  db.delete(journals).where(eq(journals.id, journalId)).run();
  return NextResponse.json({ success: true });
}
