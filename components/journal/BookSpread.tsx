'use client';

import { JournalPage } from './JournalPage';
import { PageEditor } from './PageEditor';
import { PageFlip } from './PageFlip';
import type { FlipAnimation } from '@/hooks/useJournalReader';
import type { EditorStyle } from './EditorToolbar';

interface BookSpreadProps {
  staticLeft: number;
  staticRight: number;
  pageCount: number;
  flipAnim: FlipAnimation | null;
  pageContent: Map<number, string>;
  onPageChange: (pageNumber: number, content: string) => void;
  onFlipComplete: () => void;
  widthPx: number;
  heightPx: number;
  editorStyle: EditorStyle;
}

export function BookSpread({
  staticLeft,
  staticRight,
  pageCount,
  flipAnim,
  pageContent,
  onPageChange,
  onFlipComplete,
  widthPx,
  heightPx,
  editorStyle,
}: BookSpreadProps) {
  const getContent = (page: number) => pageContent.get(page) ?? '';

  return (
    <div
      style={{
        width: widthPx * 2,
        height: heightPx,
        perspective: '2500px',
        perspectiveOrigin: 'center center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 8px 20px rgba(0,0,0,0.2)',
          borderRadius: '2px 4px 4px 2px',
          transformStyle: 'preserve-3d',
          overflow: 'hidden',
        }}
      >
        {/* Left static page */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%' }}>
          <JournalPage pageNumber={staticLeft} pageCount={pageCount} side="left">
            <PageEditor
              pageNumber={staticLeft}
              content={getContent(staticLeft)}
              onChange={onPageChange}
              pageCount={pageCount}
              editorStyle={editorStyle}
            />
          </JournalPage>
        </div>

        {/* Right static page */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%' }}>
          <JournalPage pageNumber={staticRight} pageCount={pageCount} side="right">
            <PageEditor
              pageNumber={staticRight}
              content={getContent(staticRight)}
              onChange={onPageChange}
              pageCount={pageCount}
              editorStyle={editorStyle}
            />
          </JournalPage>
        </div>

        {/* Spine shadow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: '2px',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0.04), rgba(0,0,0,0.12))',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />

        {/* Flip card */}
        {flipAnim && (
          <PageFlip
            flipAnim={flipAnim}
            onComplete={onFlipComplete}
            frontContent={
              <JournalPage
                pageNumber={flipAnim.flipFront}
                pageCount={pageCount}
                side={flipAnim.direction === 'forward' ? 'right' : 'left'}
              >
                <PageEditor
                  pageNumber={flipAnim.flipFront}
                  content={getContent(flipAnim.flipFront)}
                  onChange={onPageChange}
                  pageCount={pageCount}
                  editorStyle={editorStyle}
                />
              </JournalPage>
            }
            backContent={
              <JournalPage
                pageNumber={flipAnim.flipBack}
                pageCount={pageCount}
                side={flipAnim.direction === 'forward' ? 'left' : 'right'}
              >
                <PageEditor
                  pageNumber={flipAnim.flipBack}
                  content={getContent(flipAnim.flipBack)}
                  onChange={onPageChange}
                  pageCount={pageCount}
                  editorStyle={editorStyle}
                />
              </JournalPage>
            }
          />
        )}
      </div>
    </div>
  );
}
