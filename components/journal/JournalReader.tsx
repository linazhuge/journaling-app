'use client';

import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { useJournalReader } from '@/hooks/useJournalReader';
import { useAutoSave } from '@/hooks/useAutoSave';
import { BookSpread } from './BookSpread';
import { ReaderControls } from './ReaderControls';
import { EditorToolbar, type EditorStyle } from './EditorToolbar';
import { JOURNAL_SIZES, type JournalSize } from '@/lib/journal-config';
import { DEFAULT_FONT, DEFAULT_COLOR, DEFAULT_SIZE } from '@/lib/editor-config';
import { ActiveEditorContext } from '@/lib/active-editor-context';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface JournalReaderProps {
  journal: {
    id: string;
    name: string;
    size: string;
    coverColor: string;
    pageCount: number;
  };
}

export function JournalReader({ journal }: JournalReaderProps) {
  const size = JOURNAL_SIZES[journal.size as JournalSize] ?? JOURNAL_SIZES.standard;

  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);

  const [editorStyle, setEditorStyle] = useState<EditorStyle>({
    fontCss: DEFAULT_FONT.css,
    fontLabel: DEFAULT_FONT.label,
    color: DEFAULT_COLOR,
    sizePx: DEFAULT_SIZE,
  });

  const {
    currentSpread,
    totalSpreads,
    flipAnim,
    isFlipping,
    staticLeft,
    staticRight,
    pageContent,
    flipForward,
    flipBackward,
    onFlipComplete,
    jumpToPage,
    ensureSpreadLoaded,
    updatePageContent,
  } = useJournalReader(journal.id, journal.pageCount);

  const { schedulesSave, flushAll } = useAutoSave(journal.id);

  useEffect(() => {
    ensureSpreadLoaded(0);
  }, [ensureSpreadLoaded]);

  useEffect(() => {
    return () => flushAll();
  }, [flushAll]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack arrow keys when typing in the editor
      if ((e.target as HTMLElement)?.closest('.tiptap')) return;
      if (e.key === 'ArrowRight') flipForward();
      if (e.key === 'ArrowLeft') flipBackward();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipForward, flipBackward]);

  const handlePageChange = (pageNumber: number, content: string) => {
    updatePageContent(pageNumber, content);
    schedulesSave(pageNumber, content);
  };

  const handleRandom = async () => {
    try {
      const res = await fetch(`/api/journals/${journal.id}/random-page`);
      const { pageNumber } = await res.json();
      await jumpToPage(pageNumber);
    } catch {
      // silently ignore
    }
  };

  return (
    <ActiveEditorContext.Provider value={{ activeEditor, setActiveEditor }}>
    <div
      className="min-h-screen flex flex-col items-center justify-start py-8 px-4"
      style={{ backgroundColor: '#f0ece4' }}
    >
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          My Journals
        </Link>
        <h1
          className="text-lg font-serif text-stone-700 tracking-wide"
          style={{ color: journal.coverColor }}
        >
          {journal.name}
        </h1>
        <div className="w-24" />
      </div>

      {/* Book + toolbar row */}
      <div className="flex items-start gap-4">
        {/* Book */}
        <div className="flex flex-col items-center">
          <div
            className="rounded-t-sm"
            style={{
              width: size.widthPx * 2 + 8,
              height: 12,
              backgroundColor: journal.coverColor,
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            }}
          />
          <BookSpread
            staticLeft={staticLeft}
            staticRight={staticRight}
            pageCount={journal.pageCount}
            flipAnim={flipAnim}
            pageContent={pageContent}
            onPageChange={handlePageChange}
            onFlipComplete={onFlipComplete}
            widthPx={size.widthPx}
            heightPx={size.heightPx}
            editorStyle={editorStyle}
          />
          <div
            className="rounded-b-sm"
            style={{
              width: size.widthPx * 2 + 8,
              height: 12,
              backgroundColor: journal.coverColor,
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            }}
          />
        </div>

        {/* Right-side toolbar */}
        <div className="mt-3">
          <EditorToolbar style={editorStyle} onChange={setEditorStyle} activeEditor={activeEditor} />
        </div>
      </div>

      {/* Controls */}
      <ReaderControls
        currentSpread={currentSpread}
        totalSpreads={totalSpreads}
        pageCount={journal.pageCount}
        isFlipping={isFlipping}
        onPrev={flipBackward}
        onNext={flipForward}
        onRandom={handleRandom}
        coverColor={journal.coverColor}
      />

      <p className="mt-4 text-xs text-stone-400">
        Use ← → arrow keys to turn pages · click inside a page to write
      </p>
    </div>
    </ActiveEditorContext.Provider>
  );
}
