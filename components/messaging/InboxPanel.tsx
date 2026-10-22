'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  ConversationSummary,
  MESSAGES_CHANGED_EVENT,
  listConversations,
} from '@/lib/api/messages';
import { clearReturnTo } from '@/lib/auth/session';
import ChatThread from './ChatThread';
import { formatMessageTime, initialsOf } from './format';

interface InboxPanelProps {
  /** Open this conversation straight away (from a notification). */
  focusConversationId?: string | null;
  /** Customers get a link from each thread to the artisan's profile. */
  showProfileLink?: boolean;
  /** Message shown when there is nothing yet. */
  emptyText: string;
  emptyAction?: { label: string; href: string };
}

/**
 * Conversation list on the left, the open conversation on the right.
 * On phones it shows one at a time. Used in the artisan dashboard and on /messages.
 */
export default function InboxPanel({
  focusConversationId = null,
  showProfileLink = false,
  emptyText,
  emptyAction,
}: InboxPanelProps) {
  const { t, language } = useLanguage();
  const router = useRouter();

  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(focusConversationId);

  const load = useCallback(async () => {
    try {
      setItems(await listConversations());
    } catch {
      // keep the last list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (focusConversationId) setSelectedId(focusConversationId);
  }, [focusConversationId]);

  useEffect(() => {
    load();

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 8000);

    window.addEventListener(MESSAGES_CHANGED_EVENT, load);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener(MESSAGES_CHANGED_EVENT, load);
    };
  }, [load]);

  const selected = items.find((item) => item._id === selectedId) || null;

  const displayName = (item: ConversationSummary) => item.with.name;
  const displaySub = (item: ConversationSummary) =>
    item.with.subtitle === 'Customer' ? t('msg.inbox.customer') : item.with.subtitle;

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#0F4C45]/10 bg-white p-10 text-center text-sm text-[#083A35]/50">
        {t('msg.inbox.loading')}
      </div>
    );
  }

  if (items.length === 0 && !selectedId) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-[#0F4C45]/10 bg-white p-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8F3E8] text-[#C85A3F]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 2v-5.5A7.5 7.5 0 1 1 20 11.5Z" />
          </svg>
        </div>

        <p className="font-display text-xl text-[#083A35]">{t('msg.inbox.emptyTitle')}</p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#083A35]/55">{emptyText}</p>

        {emptyAction && (
          <Link
            href={emptyAction.href}
            className="mt-6 rounded-xl bg-[#C85A3F] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#A94632]"
          >
            {emptyAction.label}
          </Link>
        )}
      </div>
    );
  }

  const avatar = (item: ConversationSummary, size: string) => (
    <div
      className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#D5A63A] text-xs font-bold text-[#083A35]`}
    >
      {item.with.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.with.avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initialsOf(displayName(item))
      )}
    </div>
  );

  return (
    <div className="grid h-[calc(100dvh-11rem)] min-h-[480px] overflow-hidden rounded-2xl border border-[#0F4C45]/10 bg-white shadow-sm md:h-[680px] md:grid-cols-[340px_1fr] lg:grid-cols-[380px_1fr]">
      {/* Conversation list */}
      <div
        className={`min-h-0 flex-col border-[#0F4C45]/10 bg-white md:flex md:border-r ${
          selected ? 'hidden' : 'flex'
        }`}
      >
        <div className="flex h-14 shrink-0 items-center bg-[#F0F2F0] px-4">
          <p className="font-display text-lg text-[#083A35]">{t('msg.page.title')}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {items.map((item) => {
            const active = item._id === selectedId;

            return (
              <button
                key={item._id}
                type="button"
                onClick={() => setSelectedId(item._id)}
                className={`flex w-full items-center gap-3 px-3 py-3 text-left transition ${
                  active ? 'bg-[#F0F2F0]' : 'hover:bg-[#F7F8F7]'
                }`}
              >
                {avatar(item, 'h-12 w-12')}

                <div className="min-w-0 flex-1 border-b border-[#0F4C45]/5 pb-3 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[15px] font-semibold text-[#083A35]">
                      {displayName(item)}
                    </p>

                    <span
                      className={`shrink-0 text-[11px] ${
                        item.unread > 0 ? 'font-semibold text-[#0F9D58]' : 'text-[#083A35]/45'
                      }`}
                    >
                      {formatMessageTime(item.lastMessageAt, language)}
                    </span>
                  </div>

                  <div className="mt-0.5 flex items-center gap-2">
                    <p
                      className={`min-w-0 flex-1 truncate text-[13px] ${
                        item.unread > 0 ? 'font-semibold text-[#083A35]' : 'text-[#083A35]/55'
                      }`}
                    >
                      {item.lastMessage}
                    </p>

                    {item.unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0F9D58] px-1.5 text-[11px] font-bold text-white">
                        {item.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Open conversation */}
      <div className={`min-h-0 flex-col md:flex ${selected ? 'flex' : 'hidden'}`}>
        {selected ? (
          <>
            <div className="flex h-14 shrink-0 items-center gap-2 bg-[#0F4C45] px-2 text-white sm:px-3">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label={t('msg.inbox.back')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-white/10 md:hidden"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 5-7 7 7 7" />
                </svg>
              </button>

              {avatar(selected, 'h-10 w-10')}

              <div className="min-w-0 flex-1 px-1">
                <p className="truncate text-[15px] font-semibold leading-tight">
                  {displayName(selected)}
                </p>
                {displaySub(selected) && (
                  <p className="truncate text-xs leading-tight text-white/70">
                    {displaySub(selected)}
                  </p>
                )}
              </div>

              {showProfileLink && (
                <Link
                  href={`/artisan/${selected.artisanProfileId}`}
                  className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  {t('msg.inbox.viewProfile')}
                </Link>
              )}
            </div>

            <div className="min-h-0 flex-1">
              <ChatThread
                key={selected._id}
                conversationId={selected._id}
                emptyText={t('msg.inbox.pick')}
                onAuthExpired={() => {
                  clearReturnTo();
                  localStorage.removeItem('amana_token');
                  router.push('/login');
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-[#F0F2F0] p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#0F4C45] shadow-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 2v-5.5A7.5 7.5 0 1 1 20 11.5Z" />
              </svg>
            </div>
            <p className="text-sm text-[#083A35]/55">{t('msg.inbox.pick')}</p>
          </div>
        )}
      </div>
    </div>
  );
}