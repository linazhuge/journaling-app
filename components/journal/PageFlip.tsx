'use client';

import { useEffect, useRef, useState } from 'react';
import type { FlipAnimation } from '@/hooks/useJournalReader';

interface PageFlipProps {
  flipAnim: FlipAnimation;
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  onComplete: () => void;
}

export function PageFlip({ flipAnim, frontContent, backContent, onComplete }: PageFlipProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const completedRef = useRef(false);

  // Trigger the CSS animation on the next frame
  useEffect(() => {
    completedRef.current = false;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setTriggered(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform' || completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  const isForward = flipAnim.direction === 'forward';

  // Forward: flip card sits on RIGHT half, pivots on its LEFT edge (spine)
  // Backward: flip card sits on LEFT half, pivots on its RIGHT edge (spine)
  const cardStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    width: '50%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transformOrigin: isForward ? 'left center' : 'right center',
    transition: 'transform 0.65s cubic-bezier(0.645, 0.045, 0.355, 1.000)',
    zIndex: 10,
    ...(isForward ? { right: 0 } : { left: 0 }),
    transform: triggered
      ? isForward
        ? 'rotateY(-180deg)'
        : 'rotateY(180deg)'
      : 'rotateY(0deg)',
  };

  const frontStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
  };

  const backStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    // Counter-rotate so content reads correctly when flipped
    transform: isForward ? 'rotateY(180deg)' : 'rotateY(-180deg)',
    overflow: 'hidden',
  };

  return (
    <div ref={cardRef} style={cardStyle} onTransitionEnd={handleTransitionEnd}>
      {/* Shadow overlay for depth effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: triggered
            ? 'transparent'
            : 'linear-gradient(to right, transparent 80%, rgba(0,0,0,0.08))',
          zIndex: 1,
          pointerEvents: 'none',
          transition: 'background 0.3s',
          backfaceVisibility: 'hidden',
        }}
      />
      <div style={frontStyle}>{frontContent}</div>
      <div style={backStyle}>{backContent}</div>
    </div>
  );
}
