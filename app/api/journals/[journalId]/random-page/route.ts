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

  const pageNumber = Math.floor(Math.random() * journal.pageCount) + 1;
  return NextResponse.json({ pageNumber });
}
