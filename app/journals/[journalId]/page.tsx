import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { journals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { JournalReader } from '@/components/journal/JournalReader';

export default async function JournalPage({
  params,
}: {
  params: Promise<{ journalId: string }>;
}) {
  const { journalId } = await params;
  const db = getDb();
  const journal = db.select().from(journals).where(eq(journals.id, journalId)).get();

  if (!journal) notFound();

  return <JournalReader journal={journal} />;
}
