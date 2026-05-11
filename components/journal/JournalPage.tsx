'use client';

import { LINE_HEIGHT_PX, PAGE_PADDING_TOP, PAGE_PADDING_BOTTOM, PAGE_PADDING_LEFT, PAGE_PADDING_RIGHT } from '@/lib/editor-config';

export { PAGE_PADDING_TOP };

interface JournalPageProps {
  pageNumber: number;
  pageCount: number;
  side: 'left' | 'right';
  showLines?: boolean;
  dotGrid?: boolean;
  showPageNumber?: boolean;
  children?: React.ReactNode;
}

export function JournalPage({
  pageNumber,
  pageCount,
  side,
  showLines = true,
  dotGrid = false,
  showPageNumber = true,
  children,
}: JournalPageProps) {
  const isValid = pageNumber >= 1 && pageNumber <= pageCount;

  return (
    <div
      className={`relative w-full h-full overflow-hidden
        ${side === 'left' ? 'border-r border-stone-200' : ''}
      `}
      style={{ backgroundColor: '#faf8f3' }}
    >
      {/* Ruled lines overlay */}
      {showLines && !dotGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
          aria-hidden
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to bottom, #c8bdb0 1px, transparent 1px)`,
              backgroundSize: `100% ${LINE_HEIGHT_PX}px`,
              backgroundPositionY: `${PAGE_PADDING_TOP}px`,
              backgroundRepeat: 'repeat',
            }}
          />
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

      {/* Dot grid overlay */}
      {dotGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
          aria-hidden
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, #a09890 0.75px, transparent 0.75px)`,
              backgroundSize: `18px 18px`,
              backgroundPosition: `${PAGE_PADDING_LEFT - 9}px ${PAGE_PADDING_TOP - 9}px`,
            }}
          />
        </div>
      )}

      {/* Full-page click catcher — captures clicks in the top/left/right/bottom margins */}
      <div
        className="absolute inset-0"
        style={{ zIndex: 2 }}
        onMouseDown={(e) => {
          // Don't intercept clicks inside the editor itself
          if ((e.target as HTMLElement).closest('[contenteditable]')) return;
          e.preventDefault(); // keep editor focused
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[contenteditable]')) return;
          const editable = (e.currentTarget as HTMLElement).querySelector<HTMLElement>('[contenteditable]');
          if (!editable) return;
          const ed = (editable as HTMLElement & { __editor?: { commands: { focus: (pos?: 'start' | 'end') => void } } }).__editor;
          const rect = e.currentTarget.getBoundingClientRect();
          const relY = e.clientY - rect.top;
          if (ed) {
            ed.commands.focus(relY < PAGE_PADDING_TOP ? 'start' : undefined);
          } else {
            editable.focus();
          }
        }}
      >
        {/* Editor area — absolutely positioned to exactly match the ruled writing area */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: PAGE_PADDING_TOP,
            left: PAGE_PADDING_LEFT,
            right: PAGE_PADDING_RIGHT,
            bottom: PAGE_PADDING_BOTTOM,
            zIndex: 3,
          }}
        >
          {isValid ? children : null}
        </div>
      </div>

      {/* Page number */}
      {isValid && showPageNumber && (
        <div
          className="absolute bottom-3 text-[11px] text-stone-400 font-serif select-none"
          style={{ [side === 'left' ? 'left' : 'right']: '16px', zIndex: 4 }}
        >
          {pageNumber}
        </div>
      )}
    </div>
  );
}
