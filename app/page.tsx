import { getDb } from '@/lib/db';
import { journals } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { JournalShelf } from '@/components/journal/JournalShelf';

export default function Home() {
  const db = getDb();
  const allJournals = db.select().from(journals).orderBy(desc(journals.createdAt)).all();

  return <JournalShelf journals={allJournals} />;
}
