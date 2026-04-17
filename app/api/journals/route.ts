import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { journals } from '@/lib/db/schema';
import { JOURNAL_SIZES, type JournalSize } from '@/lib/journal-config';
import { nanoid } from 'nanoid';
import { desc } from 'drizzle-orm';

export async function GET() {
  const db = getDb();
  const all = db.select().from(journals).orderBy(desc(journals.createdAt)).all();
  return NextResponse.json(all);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, size, coverColor } = body as {
    name: string;
    size: JournalSize;
    coverColor: string;
  };

  if (!name?.trim() || !size || !coverColor) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!JOURNAL_SIZES[size]) {
    return NextResponse.json({ error: 'Invalid journal size' }, { status: 400 });
  }

  const db = getDb();
  const journal = {
    id: nanoid(),
    name: name.trim(),
    size,
    coverColor,
    pageCount: JOURNAL_SIZES[size].pageCount,
    createdAt: new Date(),
  };

  db.insert(journals).values(journal).run();
  return NextResponse.json(journal, { status: 201 });
}
