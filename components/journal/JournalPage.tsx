'use client';

import { LINE_HEIGHT_PX } from '@/lib/editor-config';

export const PAGE_PADDING_TOP = 48;

interface JournalPageProps {
  pageNumber: number;
  pageCount: number;
  side: 'left' | 'right';
  showLines?: boolean;
  children?: React.ReactNode;
}

export function JournalPage({
  pageNumber,
  pageCount,
  side,
  showLines = true,
  children,
}: JournalPageProps) {
  const isValid = pageNumber >= 1 && pageNumber <= pageCount;

  return (
    <div
      className={`relative w-full h-full flex flex-col overflow-hidden select-none
        ${side === 'left' ? 'border-r border-stone-200' : ''}
      `}
      style={{ backgroundColor: '#faf8f3' }}
    >
      {/* Ruled lines overlay — z-index 1, pointer-events off */}
      {showLines && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
          aria-hidden
        >
          {/* Horizontal rules */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to bottom, #c8bdb0 1px, transparent 1px)`,
              backgroundSize: `100% ${LINE_HEIGHT_PX}px`,
              backgroundPositionY: `${PAGE_PADDING_TOP + LINE_HEIGHT_PX - 1}px`,
              backgroundRepeat: 'repeat',
            }}
          />
          {/* Left margin line */}
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: '44px',
              width: '1px',
              backgroundColor: '#f0b8b8',
              opacity: 0.7,
            }}
          />
        </div>
      )}

      {/* Content area — z-index 2 with transparent background so lines show through */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          paddingTop: `${PAGE_PADDING_TOP}px`,
          paddingBottom: '24px',
          paddingLeft: '56px',
          paddingRight: '24px',
          zIndex: 2,
          background: 'transparent',
        }}
      >
        {isValid ? children : null}
      </div>

      {/* Page number */}
      {isValid && (
        <div
          className="absolute bottom-3 text-[11px] text-stone-400 font-serif select-none"
          style={{ [side === 'left' ? 'left' : 'right']: '16px', zIndex: 3 }}
        >
          {pageNumber}
        </div>
      )}
    </div>
  );
}
