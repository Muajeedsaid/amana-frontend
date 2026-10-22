'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getUnread, ConversationSummary, MESSAGES_CHANGED_EVENT } from '@/lib/api/messages';
import { getSession } from '@/lib/auth/session';

/**
 * Polls the unread counter. Cheap on purpose: one small query every
 * `intervalMs`, paused while the tab is hidden, refreshed instantly when
 * the user comes back to the tab or when a chat sends/reads a message.
 */
export function useUnreadMessages(enabled = true, intervalMs = 15000) {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    if (busy.current) return;

    if (!enabled || !getSession()) {
      setCount(0);
      setItems([]);
      return;
    }

    busy.current = true;

    try {
      const data = await getUnread();
      setCount(data.count);
      setItems(data.items);
    } catch {
      // Offline or a brief server error: keep showing the last known state.
    } finally {
      busy.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    refresh();

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, intervalMs);

    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    window.addEventListener(MESSAGES_CHANGED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener(MESSAGES_CHANGED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh, intervalMs]);

  return { count, items, refresh };
}