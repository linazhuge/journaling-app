'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { JOURNAL_SIZES, COVER_COLORS, type JournalSize } from '@/lib/journal-config';

interface CreateJournalModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateJournalModal({ open, onClose }: CreateJournalModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [size, setSize] = useState<JournalSize>('standard');
  const [color, setColor] = useState(COVER_COLORS[0].value);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), size, coverColor: color }),
      });
      const journal = await res.json();
      onClose();
      router.push(`/journals/${journal.id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setName('');
    setSize('standard');
    setColor(COVER_COLORS[0].value);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">New Journal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Journal"
              maxLength={60}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-md
                bg-white outline-none focus:ring-2 focus:ring-stone-300
                placeholder:text-stone-300 font-serif"
              autoFocus
            />
          </div>

          {/* Size */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Size</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(JOURNAL_SIZES) as [JournalSize, typeof JOURNAL_SIZES[JournalSize]][]).map(
                ([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSize(key)}
                    className={`px-3 py-2.5 rounded-md border text-left transition-all
                      ${size === key
                        ? 'border-stone-600 bg-stone-50 ring-1 ring-stone-600'
                        : 'border-stone-200 hover:border-stone-400'
                      }`}
                  >
                    <div className="text-xs font-medium text-stone-700">{cfg.label}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">{cfg.subtitle}</div>
                    <div className="text-[10px] text-stone-400">{cfg.pageCount}pg</div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Cover color */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Cover</label>
            <div className="flex flex-wrap gap-2">
              {COVER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className="w-8 h-8 rounded-full transition-all hover:scale-110"
                  style={{
                    backgroundColor: c.value,
                    outline: color === c.value ? `3px solid ${c.value}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100">
            <div
              className="w-10 h-14 rounded-sm shadow-md flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <div>
              <p className="font-serif text-sm text-stone-700">{name || 'My Journal'}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {JOURNAL_SIZES[size].label} · {JOURNAL_SIZES[size].pageCount} pages
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || loading}
              style={{ backgroundColor: color, borderColor: color }}
              className="text-white hover:opacity-90"
            >
              {loading ? 'Creating…' : 'Create Journal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
