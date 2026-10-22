'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface AuthGateProps {
  artisanName: string;
  /** Where to come back to after logging in (already saved for the global watcher). */
  returnTo: string;
  onClose: () => void;
}

/**
 * Shown when someone who is not logged in presses Message or WhatsApp.
 * Both buttons carry ?redirect=, and the exact place is also remembered
 * so they come straight back here once they are in.
 */
export default function AuthGate({ artisanName, returnTo, onClose }: AuthGateProps) {
  const { t } = useLanguage();
  const query = `redirect=${encodeURIComponent(returnTo)}`;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#083A35]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-7 shadow-2xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F4C45] text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
        </div>

        <h3 className="font-display text-2xl text-[#083A35]">{t('msg.gate.title')}</h3>

        <p className="mt-2 text-sm leading-6 text-[#083A35]/60">
          {t('msg.gate.text', { name: artisanName })}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href={`/login?${query}`}
            className="rounded-xl bg-[#C85A3F] px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#A94632]"
          >
            {t('msg.gate.login')}
          </Link>

          <Link
            href={`/register?${query}`}
            className="rounded-xl border border-[#0F4C45]/20 px-5 py-3.5 text-center text-sm font-bold text-[#083A35] transition hover:bg-[#F8F3E8]"
          >
            {t('msg.gate.register')}
          </Link>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-xl px-5 py-2.5 text-sm font-semibold text-[#083A35]/55 transition hover:text-[#083A35]"
        >
          {t('msg.gate.cancel')}
        </button>
      </div>
    </div>
  );
}