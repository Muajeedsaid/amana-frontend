'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { clearReturnTo, getSession } from '@/lib/auth/session';
import ChatThread from './ChatThread';
import { initialsOf } from './format';

interface ChatModalProps {
  artisanProfileId: string;
  artisanName: string;
  artisanAvatar?: string;
  onClose: () => void;
}

/** The message window on an artisan's page. Bottom sheet on phones, centred card on desktop. */
export default function ChatModal({
  artisanProfileId,
  artisanName,
  artisanAvatar,
  onClose,
}: ChatModalProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const session = getSession();
  const isCustomer = !!session && session.role !== 'artisan';

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-stretch justify-center bg-[#083A35]/60 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[640px] sm:max-w-lg sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 bg-[#0F4C45] px-2 text-white sm:px-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#D5A63A] text-sm font-bold text-[#083A35]">
            {artisanAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={artisanAvatar} alt="" className="h-full w-full object-cover" />
            ) : (
              initialsOf(artisanName)
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-tight">
              {t('msg.chat.title', { name: artisanName })}
            </p>
            <p className="truncate text-xs leading-tight text-white/70">
              {t('msg.chat.subtitle', { name: artisanName })}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('msg.chat.close')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1">
          {isCustomer ? (
            <ChatThread
              artisanProfileId={artisanProfileId}
              emptyText={t('msg.chat.empty')}
              otherName={artisanName}
              onAuthExpired={() => {
                clearReturnTo();
                localStorage.removeItem('amana_token');
                router.push('/login');
              }}
            />
          ) : (
            <p className="mx-auto max-w-xs px-6 py-16 text-center text-sm leading-6 text-[#083A35]/60">
              {t('msg.chat.customersOnly')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}