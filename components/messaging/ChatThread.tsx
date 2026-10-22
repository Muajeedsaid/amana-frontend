'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  ApiError,
  ThreadMessage,
  announceMessagesChanged,
  getConversationThread,
  getThreadWithArtisan,
  replyToConversation,
  sendFirstMessage,
} from '@/lib/api/messages';
import { dayKey, formatClock, formatDayLabel } from './format';

interface ChatThreadProps {
  /** Open an existing conversation (inbox, dashboard). */
  conversationId?: string | null;
  /** Or: the chat with this artisan (artisan page). Created on the first message. */
  artisanProfileId?: string;
  /** Shown when there are no messages yet. */
  emptyText: string;
  /** Name of the person on the other side, for the "message sent" notice. */
  otherName?: string;
  /** How often to look for new messages while open (ms). */
  pollMs?: number;
  onAuthExpired?: () => void;
}

/**
 * The conversation itself: bubbles + the box to type in.
 * Looks for new messages every few seconds, so a reply shows up on its own.
 *
 * Mount it with `key={conversationId}` when switching conversations.
 */
export default function ChatThread({
  conversationId = null,
  artisanProfileId,
  emptyText,
  otherName = '',
  pollMs = 5000,
  onAuthExpired,
}: ChatThreadProps) {
  const { t, language } = useLanguage();

  const [convId, setConvId] = useState<string | null>(conversationId);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [justSent, setJustSent] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastCount = useRef(-1);
  // Messages I just sent. A refresh that started before the send finished
  // may not include them yet, so keep them on screen until the server does.
  const sentRef = useRef<Map<string, ThreadMessage>>(new Map());

  const handleAuth = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        onAuthExpired?.();
        return true;
      }
      return false;
    },
    [onAuthExpired]
  );

  const load = useCallback(
    async (silent: boolean) => {
      try {
        const data = convId
          ? await getConversationThread(convId)
          : artisanProfileId
            ? await getThreadWithArtisan(artisanProfileId)
            : null;

        if (!data) return;

        if (data.conversation) setConvId(data.conversation._id);

        const serverIds = new Set(data.messages.map((m) => m._id));
        const stillMissing: ThreadMessage[] = [];

        sentRef.current.forEach((message, id) => {
          if (serverIds.has(id)) sentRef.current.delete(id);
          else stillMissing.push(message);
        });

        setMessages([...data.messages, ...stillMissing]);

        setLoadError('');

        // The thread was just opened or something new arrived: refresh the bell.
        if (lastCount.current !== data.messages.length) {
          lastCount.current = data.messages.length;
          announceMessagesChanged();
        }
      } catch (error) {
        if (handleAuth(error)) return;
        if (!silent) setLoadError(t('msg.chat.loadError'));
      } finally {
        setLoading(false);
      }
    },
    [convId, artisanProfileId, handleAuth, t]
  );

  useEffect(() => {
    load(false);

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load(true);
    }, pollMs);

    return () => window.clearInterval(timer);
  }, [load, pollMs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  async function send() {
    const body = text.trim();
    if (!body || sending) return;

    setSending(true);
    setSendError('');

    try {
      if (convId) {
        const { message } = await replyToConversation(convId, body);
        sentRef.current.set(message._id, message);
        setMessages((previous) => [...previous, message]);
      } else if (artisanProfileId) {
        const result = await sendFirstMessage(artisanProfileId, body);
        sentRef.current.set(result.message._id, result.message);
        setConvId(result.conversationId);
        setMessages((previous) => [...previous, result.message]);
        setJustSent(true);
      }

      setText('');
      announceMessagesChanged();
    } catch (error) {
      if (handleAuth(error)) return;

      setSendError(
        error instanceof ApiError && error.status !== 0 && error.status < 500
          ? error.message
          : t('msg.chat.sendError')
      );
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter makes a new line.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className="min-h-0 flex-1 overflow-y-auto bg-[#EFE7D8] px-3 py-4 sm:px-6"
        style={{
          backgroundImage:
            'radial-gradient(rgba(8,58,53,0.06) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      >
        {loading ? (
          <p className="mx-auto w-fit rounded-full bg-white/80 px-4 py-1.5 text-xs text-[#083A35]/60 shadow-sm">
            {t('msg.chat.loading')}
          </p>
        ) : loadError ? (
          <p className="mx-auto w-fit rounded-xl bg-white px-4 py-2 text-xs text-red-600 shadow-sm">
            {loadError}
          </p>
        ) : messages.length === 0 ? (
          <p className="mx-auto mt-6 max-w-xs rounded-xl bg-[#FFF6D6] px-4 py-3 text-center text-xs leading-5 text-[#083A35]/70 shadow-sm">
            {emptyText}
          </p>
        ) : (
          <div className="flex flex-col">
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const newDay = !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt);
              const sameSender = previous && previous.mine === message.mine && !newDay;

              return (
                <div key={message._id} className="flex flex-col">
                  {newDay && (
                    <div className="my-3 flex justify-center">
                      <span className="rounded-lg bg-white/90 px-3 py-1 text-[11px] font-medium text-[#083A35]/60 shadow-sm">
                        {formatDayLabel(message.createdAt, language)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex ${message.mine ? 'justify-end' : 'justify-start'} ${
                      sameSender ? 'mt-0.5' : 'mt-2'
                    }`}
                  >
                    <div
                      className={`relative max-w-[85%] rounded-lg px-2.5 pb-1.5 pt-1.5 text-[14.5px] leading-[1.35] shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] sm:max-w-[70%] ${
                        message.mine
                          ? `bg-[#D9F2DD] text-[#0b2a26] ${sameSender ? '' : 'rounded-tr-none'}`
                          : `bg-white text-[#0b2a26] ${sameSender ? '' : 'rounded-tl-none'}`
                      }`}
                    >
                      <span className="whitespace-pre-wrap break-words">{message.text}</span>
                      {/* invisible spacer so the time never covers the last word */}
                      <span className="inline-block w-[4.2rem]" aria-hidden="true" />

                      <span className="absolute bottom-1 right-2 flex items-center gap-1 text-[10.5px] text-[#083A35]/45">
                        {formatClock(message.createdAt, language)}
                        {message.mine && (
                          <svg width="15" height="11" viewBox="0 0 16 11" fill="none" stroke="#2F8F6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m1 6 3 3 6-7.5M7 8.5 8.5 10 15 2" />
                          </svg>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {justSent && otherName && (
        <p className="bg-[#E3F1EA] px-4 py-2 text-center text-xs text-[#0F4C45]">
          {t('msg.chat.sentNotice', { name: otherName })}
        </p>
      )}

      <div className="bg-[#F0F2F0] px-2 py-2 sm:px-3">
        {sendError && <p className="mb-1.5 px-2 text-xs text-red-600">{sendError}</p>}

        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={1000}
            placeholder={t('msg.chat.placeholder')}
            className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-3xl border-0 bg-white px-4 py-[11px] text-[15px] leading-[22px] text-[#083A35] shadow-sm outline-none placeholder:text-[#083A35]/40"
          />

          <button
            type="button"
            onClick={send}
            disabled={sending || !text.trim()}
            aria-label={t('msg.chat.send')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F4C45] text-white shadow-sm transition hover:bg-[#083A35] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}