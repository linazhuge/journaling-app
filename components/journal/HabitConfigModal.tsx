'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type HabitData } from './HabitGrid';
import { HABIT_PALETTES, MAX_HABITS } from '@/lib/habit-config';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface HabitConfigModalProps {
  journalId: string;
  year: number;
  month: number;
  habits: HabitData[];
  onClose: () => void;
  onUpdate: (habits: HabitData[]) => void;
}

export function HabitConfigModal({
  journalId, year, month, habits: initialHabits, onClose, onUpdate,
}: HabitConfigModalProps) {
  const [habits, setHabits] = useState(initialHabits);
  const [newName, setNewName] = useState('');

  const update = (next: HabitData[]) => {
    setHabits(next);
    onUpdate(next);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const color = HABIT_PALETTES[0].colors[habits.length % HABIT_PALETTES[0].colors.length];
    const res = await fetch(`/api/journals/${journalId}/habits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), color, order: habits.length, year, month }),
    });
    const habit = await res.json();
    update([...habits, habit]);
    setNewName('');
  };

  const handleDelete = async (habitId: string) => {
    update(habits.filter(h => h.id !== habitId));
    await fetch(`/api/journals/${journalId}/habits/${habitId}`, { method: 'DELETE' });
  };

  const handlePalette = async (paletteIndex: number) => {
    const palette = HABIT_PALETTES[paletteIndex];
    const next = habits.map((h, i) => ({ ...h, color: palette.colors[i % palette.colors.length] }));
    update(next);
    await Promise.all(next.map(h =>
      fetch(`/api/journals/${journalId}/habits/${h.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: h.color }),
      })
    ));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">
            {MONTH_NAMES[month - 1]} {year}
          </DialogTitle>
        </DialogHeader>

        {/* Palette picker */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-stone-500">Color palette</p>
          <div className="flex gap-3 flex-wrap">
            {HABIT_PALETTES.map((palette, i) => (
              <button
                key={palette.name}
                onClick={() => handlePalette(i)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="flex gap-0.5 rounded overflow-hidden ring-1 ring-transparent group-hover:ring-stone-300 transition-all p-0.5">
                  {palette.colors.slice(0, 5).map((c) => (
                    <div key={c} className="w-4 h-4 rounded-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-[10px] text-stone-400 group-hover:text-stone-600 transition-colors font-serif">
                  {palette.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Habit list */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-stone-500">Habits</p>
          <div className="space-y-1">
            {habits.length === 0 && (
              <p className="text-xs text-stone-300 italic">No habits yet</p>
            )}
            {habits.map((h) => (
              <div key={h.id} className="flex items-center gap-2 py-1">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: h.color }} />
                <span className="text-sm text-stone-700 flex-1 font-serif">{h.name}</span>
                <button
                  onClick={() => handleDelete(h.id)}
                  className="text-stone-300 hover:text-stone-500 transition-colors"
                  aria-label="Delete habit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {habits.length < MAX_HABITS && (
            <form onSubmit={handleAdd} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Add habit…"
                maxLength={40}
                className="flex-1 text-sm bg-transparent outline-none border-b border-stone-200 py-1
                  placeholder:text-stone-300 text-stone-700 font-serif focus:border-stone-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!newName.trim()}
                className="text-stone-400 hover:text-stone-600 disabled:opacity-30 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
