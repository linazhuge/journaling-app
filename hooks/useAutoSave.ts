'use client';

import { useRef, useCallback } from 'react';

export function useAutoSave(journalId: string) {
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const pending = useRef<Map<number, string>>(new Map());

  const save = useCallback(
    async (pageNumber: number, content: string) => {
      await fetch(`/api/journals/${journalId}/pages/${pageNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      pending.current.delete(pageNumber);
    },
    [journalId]
  );

  const schedulesSave = useCallback(
    (pageNumber: number, content: string) => {
      pending.current.set(pageNumber, content);

      const existing = timers.current.get(pageNumber);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        save(pageNumber, content);
        timers.current.delete(pageNumber);
      }, 800);

      timers.current.set(pageNumber, timer);
    },
    [save]
  );

  const flushPage = useCallback(
    (pageNumber: number) => {
      const content = pending.current.get(pageNumber);
      if (content === undefined) return;

      const existing = timers.current.get(pageNumber);
      if (existing) {
        clearTimeout(existing);
        timers.current.delete(pageNumber);
      }
      save(pageNumber, content);
    },
    [save]
  );

  const flushAll = useCallback(() => {
    for (const [pageNumber] of pending.current) {
      flushPage(pageNumber);
    }
  }, [flushPage]);

  return { schedulesSave, flushPage, flushAll };
}
