'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import NotificationBell from './NotificationBell';
import { clearReturnTo, getSession, readReturnTo } from '@/lib/auth/session';

/**
 * Mounted once in app/layout.tsx. It does two jobs:
 *
 *  1. Shows the notification bell on every page.
 *  2. "Take me back": if someone was sent to log in / register from an
 *     artisan page, bring them back to that exact place once they are in,
 *     no matter which page the login or register form sends them to.
 */
export default function MessagingRoot() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const target = readReturnTo();
    if (!target) return;

    const session = getSession();
    if (!session) return; // still logged out: keep waiting

    // Still on the login / register screens: wait for them to move on.
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) return;

    const targetPath = target.split('?')[0];
    clearReturnTo();

    // Only customers go back to message someone. Artisans keep their normal flow.
    if (session.role === 'artisan' || session.role === 'admin') return;

    if (pathname !== targetPath) {
      router.replace(target);
    }
  }, [pathname, router]);

  return <NotificationBell />;
}