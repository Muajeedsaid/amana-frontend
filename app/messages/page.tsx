'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getSession } from '@/lib/auth/session';
import { saveReturnTo } from '@/lib/auth/session';
import InboxPanel from '@/components/messaging/InboxPanel';

/** A customer's inbox: every artisan they have written to. */
export default function MessagesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      saveReturnTo('/messages');
      router.replace(`/login?redirect=${encodeURIComponent('/messages')}`);
      return;
    }

    // Artisans read and answer messages in their dashboard.
    if (session.role === 'artisan') {
      router.replace('/dashboard?section=messages');
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return <main className="min-h-screen bg-[#F8F3E8]" />;
  }

  return (
    <main className="min-h-screen bg-[#F8F3E8] px-3 py-6 text-[#083A35] sm:px-5 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C85A3F]">
          {t('msg.page.eyebrow')}
        </p>

        <h1 className="mt-2 font-display text-3xl sm:text-4xl">{t('msg.page.title')}</h1>

        <p className="mt-2 hidden max-w-xl text-sm leading-6 text-[#083A35]/60 md:block">{t('msg.page.text')}</p>

        <div className="mt-5 md:mt-8">
          <InboxPanel
            showProfileLink
            emptyText={t('msg.inbox.emptyCustomer')}
            emptyAction={{ label: t('msg.inbox.findArtisans'), href: '/search' }}
          />
        </div>
      </div>
    </main>
  );
}