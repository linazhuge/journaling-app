import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { journals } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { JournalReader } from '@/components/journal/JournalReader';
import { HabitTrackerReader } from '@/components/journal/HabitTrackerReader';

export default async function JournalPage({
  params,
}: {
  params: Promise<{ journalId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const { journalId } = await params;
  const rows = await db
    .select()
    .from(journals)
    .where(and(eq(journals.id, journalId), eq(journals.userId, session.user.id)));

  if (!rows[0]) notFound();

  if (rows[0].type === 'habit_tracker') {
    return <HabitTrackerReader journal={rows[0]} />;
  }

  return <JournalReader journal={rows[0]} />;
}
