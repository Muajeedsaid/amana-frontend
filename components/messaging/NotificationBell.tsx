'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useUnreadMessages } from '@/lib/hooks/useUnreadMessages';
import { ConversationSummary, OPEN_CHAT_EVENT } from '@/lib/api/messages';
import { getSession } from '@/lib/auth/session';
import { formatMessageTime, initialsOf } from './format';

/** Where tapping a notification should take the person. */
export function hrefForConversation(item: ConversationSummary, role: string) {
  return role === 'artisan'
    ? `/dashboard?section=messages&c=${item._id}`
    : `/artisan/${item.artisanProfileId}?chat=1`;
}

function BellIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

/**
 * The notification bell. Floats in the corner on every page, so a customer
 * sees an artisan's reply whether or not they are on that artisan's page.
 * Hidden on /dashboard, which has its own bell, and when logged out.
 */
export default function NotificationBell() {
  const { t, language } = useLanguage();
  const pathname = usePathname();

  const [role, setRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Re-check the login state whenever the page changes (login/logout happen client-side).
  useEffect(() => {
    setRole(getSession()?.role ?? null);
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onStorage = () => setRole(getSession()?.role ?? null);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const hidden =
    !role ||
    role === 'admin' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register');

  const { count, items, refresh } = useUnreadMessages(!hidden);

  useEffect(() => {
    if (!hidden) refresh();
  }, [pathname, hidden, refresh]);

  useEffect(() => {
    if (!open) return;

    const onDown = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  if (hidden) return null;

  const viewAll = role === 'artisan' ? '/dashboard?section=messages' : '/messages';

  return (
    <div ref={box} className="fixed bottom-24 right-4 z-[60] lg:bottom-6 lg:right-6">
      {open && (
        <div className="absolute bottom-16 right-0 w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-[#0F4C45]/10 bg-white shadow-2xl shadow-[#083A35]/20">
          <div className="flex items-center justify-between border-b border-[#0F4C45]/10 px-4 py-3">
            <p className="text-sm font-bold text-[#083A35]">{t('msg.bell.title')}</p>
            {count > 0 && (
              <span className="rounded-full bg-[#C85A3F] px-2.5 py-0.5 text-[11px] font-bold text-white">
                {t('msg.bell.new', { count })}
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[#083A35]/50">{t('msg.bell.none')}</p>
            ) : (
              items.map((item) => (
                <Link
                  key={item._id}
                  href={hrefForConversation(item, role!)}
                  onClick={(event) => {
                    setOpen(false);

                    // Already on this artisan's page: just open the chat window.
                    if (role !== 'artisan' && pathname === `/artisan/${item.artisanProfileId}`) {
                      event.preventDefault();
                      window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
                    }
                  }}
                  className="flex items-start gap-3 border-b border-[#0F4C45]/5 px-4 py-3 transition hover:bg-[#F8F3E8]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#D5A63A] text-xs font-bold text-[#083A35]">
                    {item.with.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.with.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initialsOf(item.with.name)
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-[#083A35]">{item.with.name}</p>
                      <span className="shrink-0 text-[10px] text-[#083A35]/40">
                        {formatMessageTime(item.lastMessageAt, language)}
                      </span>
                    </div>

                    <p className="mt-0.5 truncate text-xs text-[#083A35]/60">{item.lastMessage}</p>
                  </div>

                  <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C85A3F] px-1.5 text-[10px] font-bold text-white">
                    {item.unread}
                  </span>
                </Link>
              ))
            )}
          </div>

          <Link
            href={viewAll}
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-sm font-bold text-[#C85A3F] transition hover:bg-[#F8F3E8]"
          >
            {t('msg.bell.viewAll')}
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t('msg.bell.aria', { count })}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-[#0F4C45] text-white shadow-xl shadow-[#083A35]/30 transition hover:-translate-y-0.5 hover:bg-[#083A35] ${
          count > 0 ? 'ring-4 ring-[#C85A3F]/30' : ''
        }`}
      >
        <BellIcon size={22} />

        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#C85A3F] px-1.5 text-[11px] font-bold text-white ring-2 ring-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
    </div>
  );
}