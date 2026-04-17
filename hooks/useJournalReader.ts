'use client';

import { useState, useCallback, useRef } from 'react';

export type FlipDirection = 'forward' | 'backward';

export interface FlipAnimation {
  direction: FlipDirection;
  fromSpread: number;
  toSpread: number;
  // Page numbers involved
  flipFront: number;  // front face of flip card
  flipBack: number;   // back face of flip card
}

export interface JournalReaderState {
  currentSpread: number;
  totalSpreads: number;
  flipAnim: FlipAnimation | null;
  isFlipping: boolean;
  // Derived page numbers for static elements
  staticLeftPage: number;
  staticRightPage: number;
  // Content cache
  pageContent: Map<number, string>;
}

export function useJournalReader(journalId: string, pageCount: number) {
  const totalSpreads = Math.ceil(pageCount / 2);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [flipAnim, setFlipAnim] = useState<FlipAnimation | null>(null);
  const [pageContent, setPageContent] = useState<Map<number, string>>(new Map());
  const isFlippingRef = useRef(false);

  const getSpreadPages = useCallback((spread: number) => ({
    left: spread * 2 + 1,
    right: spread * 2 + 2,
  }), []);

  const fetchPage = useCallback(async (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > pageCount) return;
    setPageContent(prev => {
      if (prev.has(pageNumber)) return prev;
      return prev; // fetch below
    });
    try {
      const res = await fetch(`/api/journals/${journalId}/pages/${pageNumber}`);
      const data = await res.json();
      setPageContent(prev => new Map(prev).set(pageNumber, data.content ?? ''));
    } catch {
      setPageContent(prev => new Map(prev).set(pageNumber, ''));
    }
  }, [journalId, pageCount]);

  const ensureSpreadLoaded = useCallback(async (spread: number) => {
    const { left, right } = getSpreadPages(spread);
    const fetches: Promise<void>[] = [];
    if (left <= pageCount) fetches.push(fetchPage(left));
    if (right <= pageCount) fetches.push(fetchPage(right));
    await Promise.all(fetches);
  }, [fetchPage, getSpreadPages, pageCount]);

  const updatePageContent = useCallback((pageNumber: number, content: string) => {
    setPageContent(prev => new Map(prev).set(pageNumber, content));
  }, []);

  // Compute static page numbers based on flip state
  const { staticLeft, staticRight } = (() => {
    if (!flipAnim) {
      const { left, right } = getSpreadPages(currentSpread);
      return { staticLeft: left, staticRight: right };
    }
    if (flipAnim.direction === 'forward') {
      // Static left keeps old; static right shows new right
      const { left } = getSpreadPages(flipAnim.fromSpread);
      const { right } = getSpreadPages(flipAnim.toSpread);
      return { staticLeft: left, staticRight: right };
    } else {
      // Static right keeps old; static left shows new left
      const { right } = getSpreadPages(flipAnim.fromSpread);
      const { left } = getSpreadPages(flipAnim.toSpread);
      return { staticLeft: left, staticRight: right };
    }
  })();

  const flipForward = useCallback(async () => {
    if (isFlippingRef.current || currentSpread >= totalSpreads - 1) return;
    isFlippingRef.current = true;

    const toSpread = currentSpread + 1;
    const from = getSpreadPages(currentSpread);
    const to = getSpreadPages(toSpread);

    // Pre-load destination pages
    await ensureSpreadLoaded(toSpread);

    setFlipAnim({
      direction: 'forward',
      fromSpread: currentSpread,
      toSpread,
      flipFront: from.right,
      flipBack: to.left,
    });
  }, [currentSpread, totalSpreads, getSpreadPages, ensureSpreadLoaded]);

  const flipBackward = useCallback(async () => {
    if (isFlippingRef.current || currentSpread <= 0) return;
    isFlippingRef.current = true;

    const toSpread = currentSpread - 1;
    const from = getSpreadPages(currentSpread);
    const to = getSpreadPages(toSpread);

    await ensureSpreadLoaded(toSpread);

    setFlipAnim({
      direction: 'backward',
      fromSpread: currentSpread,
      toSpread,
      flipFront: from.left,
      flipBack: to.right,
    });
  }, [currentSpread, getSpreadPages, ensureSpreadLoaded]);

  const onFlipComplete = useCallback(() => {
    if (!flipAnim) return;
    setCurrentSpread(flipAnim.toSpread);
    setFlipAnim(null);
    isFlippingRef.current = false;

    // Pre-load next spread in the direction we were going
    const nextSpread = flipAnim.direction === 'forward'
      ? flipAnim.toSpread + 1
      : flipAnim.toSpread - 1;
    if (nextSpread >= 0 && nextSpread < totalSpreads) {
      ensureSpreadLoaded(nextSpread);
    }
  }, [flipAnim, totalSpreads, ensureSpreadLoaded]);

  const jumpToSpread = useCallback(async (spread: number) => {
    if (isFlippingRef.current) return;
    const clamped = Math.max(0, Math.min(totalSpreads - 1, spread));
    await ensureSpreadLoaded(clamped);
    setCurrentSpread(clamped);
  }, [totalSpreads, ensureSpreadLoaded]);

  const jumpToPage = useCallback(async (pageNumber: number) => {
    const spread = Math.floor((pageNumber - 1) / 2);
    await jumpToSpread(spread);
  }, [jumpToSpread]);

  return {
    currentSpread,
    totalSpreads,
    flipAnim,
    isFlipping: isFlippingRef.current,
    staticLeft,
    staticRight,
    pageContent,
    flipForward,
    flipBackward,
    onFlipComplete,
    jumpToPage,
    ensureSpreadLoaded,
    updatePageContent,
    getSpreadPages,
  };
}
