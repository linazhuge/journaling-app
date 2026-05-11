'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import Link from 'next/link';
import { HabitGrid, type HabitData, DOT } from './HabitGrid';
import { HabitConfigModal } from './HabitConfigModal';
import { JournalPage } from './JournalPage';
import { JOURNAL_SIZES } from '@/lib/journal-config';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface HabitTrackerReaderProps {
  journal: { id: string; name: string; coverColor: string; pageCount: number; createdAt: Date };
}

// ── Per-page content ──────────────────────────────────────────────────────────

interface HabitPageContentProps {
  year: number;
  month: number;
  habits: HabitData[];
  onToggle: (habitId: string, day: number) => void;
}

function HabitPageContent({ year, month, habits, onToggle }: HabitPageContentProps) {
  const col1 = habits.filter((_, i) => i % 2 === 0);
  const col2 = habits.filter((_, i) => i % 2 === 1);

  const renderHabit = (h: HabitData) => (
    <HabitGrid
      key={h.id}
      habit={h}
      year={year}
      month={month}
      onToggle={(day) => onToggle(h.id, day)}
    />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: DOT }}>
      {/* Month title */}
      <div style={{ height: DOT * 2, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 18, fontFamily: 'serif', color: '#57534e', fontWeight: 600, letterSpacing: '0.04em' }}>
          {MONTH_NAMES[month - 1]} {year}
        </span>
      </div>

      {/* Two columns of habits */}
      {habits.length > 0 && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: DOT, marginLeft: '54px' }}>
            {col1.map(renderHabit)}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: DOT }}>
            {col2.map(renderHabit)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main reader ───────────────────────────────────────────────────────────────

function addMonths(year: number, month: number, delta: number) {
  let m = month - 1 + delta;
  let y = year + Math.floor(m / 12);
  m = ((m % 12) + 12) % 12;
  return { year: y, month: m + 1 };
}

export function HabitTrackerReader({ journal }: HabitTrackerReaderProps) {
  const today = new Date();
  const startDate = new Date(journal.createdAt);
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;
  const totalSpreads = Math.floor((journal.pageCount || 12) / 2);

  // Clamp today's position to a valid spread index
  const todayMonthsFromStart = (today.getFullYear() - startYear) * 12 + (today.getMonth() + 1 - startMonth);
  const initialSpreadIdx = Math.max(0, Math.min(Math.floor(todayMonthsFromStart / 2), totalSpreads - 1));
  const initialSpread = addMonths(startYear, startMonth, initialSpreadIdx * 2);

  const [spreadYear, setSpreadYear] = useState(initialSpread.year);
  const [spreadMonth, setSpreadMonth] = useState(initialSpread.month);
  const [leftHabits, setLeftHabits] = useState<HabitData[]>([]);
  const [rightHabits, setRightHabits] = useState<HabitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalPage, setModalPage] = useState<'left' | 'right' | null>(null);

  const right = addMonths(spreadYear, spreadMonth, 1);
  const { widthPx, heightPx } = JOURNAL_SIZES.large;

  // Current spread index (0-based) and page numbers
  const spreadIdx = ((spreadYear - startYear) * 12 + (spreadMonth - startMonth)) / 2;
  const leftPageNumber = spreadIdx * 2 + 1;
  const rightPageNumber = spreadIdx * 2 + 2;

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    try {
      const [l, r] = await Promise.all([
        fetch(`/api/journals/${journal.id}/habits?year=${spreadYear}&month=${spreadMonth}`).then((res) => res.json()),
        fetch(`/api/journals/${journal.id}/habits?year=${right.year}&month=${right.month}`).then((res) => res.json()),
      ]);
      setLeftHabits(Array.isArray(l) ? l : []);
      setRightHabits(Array.isArray(r) ? r : []);
    } finally {
      setLoading(false);
    }
  }, [journal.id, spreadYear, spreadMonth, right.year, right.month]);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const prevSpread = () => {
    if (spreadIdx <= 0) return;
    const { year, month } = addMonths(spreadYear, spreadMonth, -2);
    setSpreadYear(year); setSpreadMonth(month);
  };
  const nextSpread = () => {
    if (spreadIdx >= totalSpreads - 1) return;
    const { year, month } = addMonths(spreadYear, spreadMonth, 2);
    setSpreadYear(year); setSpreadMonth(month);
  };

  const leftLabel = MONTH_NAMES[spreadMonth - 1];
  const rightLabel = MONTH_NAMES[right.month - 1];
  const yearLabel = spreadYear === right.year ? `${spreadYear}` : `${spreadYear} / ${right.year}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4" style={{ backgroundColor: '#f0ece4' }}>
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          My Journals
        </Link>
        <h1 className="text-lg font-serif tracking-wide" style={{ color: journal.coverColor }}>
          {journal.name}
        </h1>
        <div className="w-24" />
      </div>

      {/* Book */}
      <div className="flex flex-col items-center">
        <div className="rounded-t-sm" style={{ width: widthPx * 2 + 8, height: 12, backgroundColor: journal.coverColor, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }} />

        <div style={{ position: 'relative', width: widthPx * 2, height: heightPx, boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 8px 20px rgba(0,0,0,0.2)', borderRadius: '2px 4px 4px 2px', overflow: 'hidden' }}>
          {/* Left page */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%' }}>
            <JournalPage pageNumber={leftPageNumber} pageCount={journal.pageCount || 12} side="left" showLines={false} dotGrid>
              {!loading && (
                <HabitPageContent
                  year={spreadYear}
                  month={spreadMonth}
                  habits={leftHabits}
                  onToggle={async (habitId, day) => {
                    const dateStr = `${spreadYear}-${String(spreadMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isCompleted = leftHabits.find(h => h.id === habitId)?.completedDays.includes(day) ?? false;
                    setLeftHabits(prev => prev.map(h => h.id !== habitId ? h : {
                      ...h,
                      completedDays: isCompleted ? h.completedDays.filter(d => d !== day) : [...h.completedDays, day].sort((a, b) => a - b),
                    }));
                    if (isCompleted) {
                      fetch(`/api/journals/${journal.id}/habits/${habitId}/logs/${dateStr}`, { method: 'DELETE' });
                    } else {
                      fetch(`/api/journals/${journal.id}/habits/${habitId}/logs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: dateStr }) });
                    }
                  }}
                />
              )}
            </JournalPage>
          </div>

          {/* Right page */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%' }}>
            <JournalPage pageNumber={rightPageNumber} pageCount={journal.pageCount || 12} side="right" showLines={false} dotGrid>
              {!loading && (
                <HabitPageContent
                  year={right.year}
                  month={right.month}
                  habits={rightHabits}
                  onToggle={async (habitId, day) => {
                    const dateStr = `${right.year}-${String(right.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isCompleted = rightHabits.find(h => h.id === habitId)?.completedDays.includes(day) ?? false;
                    setRightHabits(prev => prev.map(h => h.id !== habitId ? h : {
                      ...h,
                      completedDays: isCompleted ? h.completedDays.filter(d => d !== day) : [...h.completedDays, day].sort((a, b) => a - b),
                    }));
                    if (isCompleted) {
                      fetch(`/api/journals/${journal.id}/habits/${habitId}/logs/${dateStr}`, { method: 'DELETE' });
                    } else {
                      fetch(`/api/journals/${journal.id}/habits/${habitId}/logs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: dateStr }) });
                    }
                  }}
                />
              )}
            </JournalPage>
          </div>

          {/* Spine shadow */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '2px', transform: 'translateX(-50%)', background: 'linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0.04), rgba(0,0,0,0.12))', zIndex: 5, pointerEvents: 'none' }} />
        </div>

        <div className="rounded-b-sm" style={{ width: widthPx * 2 + 8, height: 12, backgroundColor: journal.coverColor, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }} />
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-4 mt-6">
        <button onClick={prevSpread} disabled={spreadIdx <= 0} className="text-stone-400 hover:text-stone-700 transition-colors disabled:opacity-20 disabled:cursor-default" aria-label="Previous spread">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-serif text-stone-600 text-sm w-52 text-center">
          {leftLabel} · {rightLabel} {yearLabel}
        </span>
        <button onClick={nextSpread} disabled={spreadIdx >= totalSpreads - 1} className="text-stone-400 hover:text-stone-700 transition-colors disabled:opacity-20 disabled:cursor-default" aria-label="Next spread">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Edit buttons */}
      <div className="flex gap-6 mt-3">
        <button
          onClick={() => setModalPage('left')}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors font-serif"
        >
          <Pencil className="w-3 h-3" />
          {leftLabel}
        </button>
        <button
          onClick={() => setModalPage('right')}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors font-serif"
        >
          <Pencil className="w-3 h-3" />
          {rightLabel}
        </button>
      </div>

      {/* Config modal */}
      {modalPage === 'left' && (
        <HabitConfigModal
          journalId={journal.id}
          year={spreadYear}
          month={spreadMonth}
          habits={leftHabits}
          onClose={() => setModalPage(null)}
          onUpdate={setLeftHabits}
        />
      )}
      {modalPage === 'right' && (
        <HabitConfigModal
          journalId={journal.id}
          year={right.year}
          month={right.month}
          habits={rightHabits}
          onClose={() => setModalPage(null)}
          onUpdate={setRightHabits}
        />
      )}
    </div>
  );
}
