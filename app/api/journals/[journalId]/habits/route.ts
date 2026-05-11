import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { habits, habitLogs, journals } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { nanoid } from 'nanoid';
import { and, eq, inArray } from 'drizzle-orm';

async function verifyOwnership(journalId: string, userId: string) {
  const rows = await db
    .select({ id: journals.id })
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
  if (!(await verifyOwnership(journalId, session.user.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') ?? '0');
  const month = parseInt(searchParams.get('month') ?? '0');
  if (!year || month < 1 || month > 12) {
    return NextResponse.json({ error: 'Invalid year/month' }, { status: 400 });
  }

  const monthHabits = await db
    .select()
    .from(habits)
    .where(
      and(
        eq(habits.journalId, journalId),
        eq(habits.year, year),
        eq(habits.month, month)
      )
    )
    .orderBy(habits.order, habits.createdAt);

  if (!monthHabits.length) return NextResponse.json([]);

  const habitIds = monthHabits.map((h) => h.id);
  const logs = await db
    .select()
    .from(habitLogs)
    .where(inArray(habitLogs.habitId, habitIds));

  const logsByHabit = new Map<string, number[]>();
  for (const log of logs) {
    const day = parseInt(log.date.split('-')[2]);
    if (!logsByHabit.has(log.habitId)) logsByHabit.set(log.habitId, []);
    logsByHabit.get(log.habitId)!.push(day);
  }

  return NextResponse.json(
    monthHabits.map((h) => ({
      ...h,
      completedDays: (logsByHabit.get(h.id) ?? []).sort((a, b) => a - b),
    }))
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ journalId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { journalId } = await params;
  if (!(await verifyOwnership(journalId, session.user.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { name, color, order, year, month } = (await request.json()) as {
    name: string;
    color: string;
    order: number;
    year: number;
    month: number;
  };

  if (!name?.trim() || !color || !year || !month) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const habit = {
    id: nanoid(),
    journalId,
    name: name.trim(),
    color,
    order: order ?? 0,
    year,
    month,
    createdAt: new Date(),
  };

  await db.insert(habits).values(habit);
  return NextResponse.json({ ...habit, completedDays: [] }, { status: 201 });
}
