import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { journals } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';
import { JournalShelf } from '@/components/journal/JournalShelf';

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const allJournals = await db
    .select()
    .from(journals)
    .where(eq(journals.userId, session.user.id))
    .orderBy(desc(journals.createdAt));

  return <JournalShelf journals={allJournals} />;
}
