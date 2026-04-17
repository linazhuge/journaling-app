import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { pages, journals } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

type Params = { params: Promise<{ journalId: string; pageNumber: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { journalId, pageNumber } = await params;
  const pageNum = parseInt(pageNumber, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
  }

  const db = getDb();
  const page = db
    .select()
    .from(pages)
    .where(and(eq(pages.journalId, journalId), eq(pages.pageNumber, pageNum)))
    .get();

  return NextResponse.json({ pageNumber: pageNum, content: page?.content ?? '' });
}

export async function PUT(request: Request, { params }: Params) {
  const { journalId, pageNumber } = await params;
  const pageNum = parseInt(pageNumber, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
  }

  const db = getDb();
  const journal = db.select().from(journals).where(eq(journals.id, journalId)).get();
  if (!journal) return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
  if (pageNum > journal.pageCount) {
    return NextResponse.json({ error: 'Page out of range' }, { status: 400 });
  }

  const { content } = (await request.json()) as { content: string };

  const existing = db
    .select()
    .from(pages)
    .where(and(eq(pages.journalId, journalId), eq(pages.pageNumber, pageNum)))
    .get();

  if (existing) {
    db.update(pages)
      .set({ content, updatedAt: new Date() })
      .where(and(eq(pages.journalId, journalId), eq(pages.pageNumber, pageNum)))
      .run();
  } else {
    db.insert(pages)
      .values({ id: nanoid(), journalId, pageNumber: pageNum, content, updatedAt: new Date() })
      .run();
  }

  return NextResponse.json({ pageNumber: pageNum, content });
}
