import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pages, journals } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

type Params = { params: Promise<{ journalId: string; pageNumber: string }> };

export async function GET(request: Request, { params }: Params) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { journalId, pageNumber } = await params;
  const pageNum = parseInt(pageNumber, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
  }

  // Verify journal ownership
  const journalRows = await db
    .select()
    .from(journals)
    .where(and(eq(journals.id, journalId), eq(journals.userId, session.user.id)));
  if (!journalRows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const pageRows = await db
    .select()
    .from(pages)
    .where(and(eq(pages.journalId, journalId), eq(pages.pageNumber, pageNum)));

  return NextResponse.json({ pageNumber: pageNum, content: pageRows[0]?.content ?? '' });
}

export async function PUT(request: Request, { params }: Params) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { journalId, pageNumber } = await params;
  const pageNum = parseInt(pageNumber, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
  }

  const journalRows = await db
    .select()
    .from(journals)
    .where(and(eq(journals.id, journalId), eq(journals.userId, session.user.id)));
  const journal = journalRows[0];
  if (!journal) return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
  if (pageNum > journal.pageCount) {
    return NextResponse.json({ error: 'Page out of range' }, { status: 400 });
  }

  const { content } = (await request.json()) as { content: string };

  const existing = await db
    .select()
    .from(pages)
    .where(and(eq(pages.journalId, journalId), eq(pages.pageNumber, pageNum)));

  if (existing[0]) {
    await db
      .update(pages)
      .set({ content, updatedAt: new Date() })
      .where(and(eq(pages.journalId, journalId), eq(pages.pageNumber, pageNum)));
  } else {
    await db
      .insert(pages)
      .values({ id: nanoid(), journalId, pageNumber: pageNum, content, updatedAt: new Date() });
  }

  return NextResponse.json({ pageNumber: pageNum, content });
}
