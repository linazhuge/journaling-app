import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { journals } from '@/lib/db/schema';
import { JOURNAL_SIZES, HABIT_TRACKER_DURATIONS, type JournalSize, type HabitTrackerDuration } from '@/lib/journal-config';
import { auth } from '@/lib/auth';
import { nanoid } from 'nanoid';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const all = await db
    .select()
    .from(journals)
    .where(eq(journals.userId, session.user.id))
    .orderBy(desc(journals.createdAt));

  return NextResponse.json(all);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, size, coverColor, type = 'writing', duration = '1yr' } = body as {
    name: string;
    size: JournalSize;
    coverColor: string;
    type?: string;
    duration?: HabitTrackerDuration;
  };

  if (!name?.trim() || !coverColor) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const journalType = type === 'habit_tracker' ? 'habit_tracker' : 'writing';
  const journalSize: JournalSize = journalType === 'habit_tracker' ? 'standard' : (size ?? 'standard');

  if (journalType === 'writing' && !JOURNAL_SIZES[journalSize]) {
    return NextResponse.json({ error: 'Invalid journal size' }, { status: 400 });
  }

  const journal = {
    id: nanoid(),
    userId: session.user.id,
    name: name.trim(),
    type: journalType,
    size: journalSize,
    coverColor,
    pageCount: journalType === 'habit_tracker'
      ? (HABIT_TRACKER_DURATIONS[duration] ?? HABIT_TRACKER_DURATIONS['1yr']).pageCount
      : JOURNAL_SIZES[journalSize].pageCount,
    createdAt: new Date(),
  };

  await db.insert(journals).values(journal);
  return NextResponse.json(journal, { status: 201 });
}
