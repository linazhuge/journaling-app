'use client';

import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';

interface ReaderControlsProps {
  currentSpread: number;
  totalSpreads: number;
  pageCount: number;
  isFlipping: boolean;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
  coverColor: string;
}

export function ReaderControls({
  currentSpread,
  totalSpreads,
  pageCount,
  isFlipping,
  onPrev,
  onNext,
  onRandom,
  coverColor,
}: ReaderControlsProps) {
  const leftPage = currentSpread * 2 + 1;
  const rightPage = Math.min(currentSpread * 2 + 2, pageCount);

  return (
    <div className="flex items-center gap-6 mt-6">
      <button
        onClick={onPrev}
        disabled={isFlipping || currentSpread === 0}
        className="flex items-center justify-center w-10 h-10 rounded-full transition-all
          disabled:opacity-30 disabled:cursor-not-allowed
          hover:scale-110 active:scale-95"
        style={{
          backgroundColor: currentSpread === 0 ? 'transparent' : `${coverColor}22`,
          color: coverColor,
        }}
        aria-label="Previous spread"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3">
        <span className="text-sm text-stone-500 font-serif tabular-nums">
          {leftPage}
          {rightPage !== leftPage && rightPage <= pageCount ? `–${rightPage}` : ''}
        </span>
        <span className="text-stone-300 text-sm">of</span>
        <span className="text-sm text-stone-500 font-serif">{pageCount}</span>
      </div>

      <button
        onClick={onRandom}
        disabled={isFlipping}
        className="flex items-center justify-center w-8 h-8 rounded-full transition-all
          disabled:opacity-30 disabled:cursor-not-allowed
          hover:scale-110 active:scale-95 text-stone-400 hover:text-stone-600"
        aria-label="Jump to random page"
        title="Random page"
      >
        <Shuffle className="w-4 h-4" />
      </button>

      <button
        onClick={onNext}
        disabled={isFlipping || currentSpread >= totalSpreads - 1}
        className="flex items-center justify-center w-10 h-10 rounded-full transition-all
          disabled:opacity-30 disabled:cursor-not-allowed
          hover:scale-110 active:scale-95"
        style={{
          backgroundColor: currentSpread >= totalSpreads - 1 ? 'transparent' : `${coverColor}22`,
          color: coverColor,
        }}
        aria-label="Next spread"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
