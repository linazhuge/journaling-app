'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, BookOpen } from 'lucide-react';
import { CreateJournalModal } from './CreateJournalModal';
import { JOURNAL_SIZES, type JournalSize } from '@/lib/journal-config';

interface Journal {
  id: string;
  name: string;
  size: string;
  coverColor: string;
  pageCount: number;
  createdAt: Date | number | null;
}

interface JournalShelfProps {
  journals: Journal[];
}

export function JournalShelf({ journals }: JournalShelfProps) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: '#f0ece4' }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-3xl font-serif text-stone-800 tracking-wide">My Journals</h1>
            <p className="text-stone-500 text-sm mt-1">
              {journals.length === 0
                ? 'Start your first journal'
                : `${journals.length} journal${journals.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
              bg-stone-800 text-stone-100 hover:bg-stone-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Journal
          </button>
        </div>

        {/* Shelf */}
        {journals.length === 0 ? (
          <EmptyShelf onNew={() => setShowCreate(true)} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {journals.map((journal) => (
              <JournalSpine key={journal.id} journal={journal} />
            ))}
            <AddButton onClick={() => setShowCreate(true)} />
          </div>
        )}
      </div>

      <CreateJournalModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}

function JournalSpine({ journal }: { journal: Journal }) {
  const size = JOURNAL_SIZES[journal.size as JournalSize] ?? JOURNAL_SIZES.standard;
  const aspectRatio = size.widthPx / size.heightPx;

  return (
    <Link href={`/journals/${journal.id}`} className="group flex flex-col items-center gap-2">
      {/* Cover */}
      <div
        className="w-full rounded-sm shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-200 relative"
        style={{
          backgroundColor: journal.coverColor,
          aspectRatio: String(aspectRatio),
          maxWidth: '120px',
        }}
      >
        {/* Spine highlight */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2 rounded-l-sm"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        />
        {/* Pages visible on right edge */}
        <div
          className="absolute right-0 top-[2px] bottom-[2px] w-[3px]"
          style={{ backgroundColor: '#e8e0d0', opacity: 0.8 }}
        />
        {/* Book icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-xs font-serif text-stone-700 leading-tight line-clamp-2 group-hover:text-stone-900 transition-colors">
          {journal.name}
        </p>
        <p className="text-[10px] text-stone-400 mt-0.5">{size.label}</p>
      </div>
    </Link>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex flex-col items-center gap-2">
      <div
        className="w-full rounded-sm border-2 border-dashed border-stone-300 group-hover:border-stone-500
          flex items-center justify-center transition-colors"
        style={{ aspectRatio: '0.65', maxWidth: '120px' }}
      >
        <Plus className="w-6 h-6 text-stone-300 group-hover:text-stone-500 transition-colors" />
      </div>
      <p className="text-xs text-stone-400 group-hover:text-stone-600 transition-colors">New</p>
    </button>
  );
}

function EmptyShelf({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <BookOpen className="w-12 h-12 text-stone-300 mb-4" />
      <h2 className="font-serif text-stone-600 text-lg mb-2">No journals yet</h2>
      <p className="text-stone-400 text-sm mb-6">Create your first journal to start writing</p>
      <button
        onClick={onNew}
        className="px-6 py-2.5 rounded-md text-sm font-medium bg-stone-800 text-white hover:bg-stone-700 transition-colors"
      >
        Create a Journal
      </button>
    </div>
  );
}
