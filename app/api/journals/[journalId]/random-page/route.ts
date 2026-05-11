import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { journals } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ journalId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { journalId } = await params;
  const rows = await db
    .select()
    .from(journals)
    .where(and(eq(journals.id, journalId), eq(journals.userId, session.user.id)));

  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const pageNumber = Math.floor(Math.random() * rows[0].pageCount) + 1;
  return NextResponse.json({ pageNumber });
}
