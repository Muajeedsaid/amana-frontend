'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyEmail } from '@/lib/api/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('This verification link is missing a token.');
      return;
    }

    verifyEmail(token)
      .then(async (data) => {
        localStorage.setItem('amana_token', data.accessToken);

        const pendingTrade = localStorage.getItem('amana_pending_trade');

        if (pendingTrade && data.user.role === 'artisan') {
          try {
            await fetch(`${API_URL}/profiles/artisan`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.accessToken}`,
              },
              body: JSON.stringify({
                tradeCategory: pendingTrade,
                longitude: 8.5167,
                latitude: 12.0,
              }),
            });
          } catch {
            // Don't block verification success over this.
          } finally {
            localStorage.removeItem('amana_pending_trade');
          }
        }

        setUserRole(data.user.role);
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'This link is invalid or has expired.');
      });
  }, [token]);

  useEffect(() => {
    if (status === 'success' && userRole) {
      const destination = userRole === 'admin' ? '/admin' : userRole === 'artisan' ? '/dashboard' : '/';

      const timer = setTimeout(() => {
        router.push(destination);
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [status, userRole, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-sand-50 flex items-center justify-center px-5 py-10">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-terracotta-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-teal-900/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-900 text-xl font-bold text-sand-50 shadow-lg">
              A
            </div>
            <span className="font-display text-3xl font-semibold text-teal-900">Amana</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-teal-900/10 bg-white/90 p-8 text-center shadow-[0_25px_80px_rgba(10,60,60,0.12)] backdrop-blur-xl sm:p-10">
          {status === 'loading' && (
            <div className="animate-[fadeIn_0.3s_ease-out]">
              <div className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-teal-900/5" />
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-teal-900/10 border-t-terracotta-600" />
                <span className="absolute text-xl text-terracotta-600">@</span>
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
                One moment
              </p>
              <h1 className="font-display text-3xl text-teal-900">Verifying your email</h1>
              <p className="mt-3 text-sm leading-6 text-teal-800/55">
                We&apos;re confirming your email address and activating your account.
              </p>
              <div className="mx-auto mt-7 h-1.5 max-w-[180px] overflow-hidden rounded-full bg-teal-900/5">
                <div className="h-full w-1/2 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-terracotta-600" />
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="animate-[fadeIn_0.4s_ease-out]">
              <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-teal-900/5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-900 text-3xl text-white shadow-xl shadow-teal-900/20 animate-[bounce_1s_ease-out]">
                  V
                </div>
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
                You&apos;re all set
              </p>
              <h1 className="font-display text-3xl text-teal-900 sm:text-4xl">Email verified</h1>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-teal-800/60">
                Your Amana account is now active. Taking you to your account now...
              </p>
              <Link
                href="/login"
                className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-terracotta-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-terracotta-700 hover:shadow-xl"
              >
                Continue now
              </Link>
              <p className="mt-6 text-xs text-teal-900/35">Welcome to Amana.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="animate-[fadeIn_0.4s_ease-out]">
              <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl font-semibold text-red-600">
                  !
                </div>
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
                Something went wrong
              </p>
              <h1 className="font-display text-3xl text-teal-900">Verification failed</h1>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-teal-800/60">{message}</p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <Link
                  href="/register"
                  className="rounded-xl border border-teal-900/15 bg-sand-50 px-4 py-3.5 text-sm font-semibold text-teal-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                >
                  Register again
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl bg-terracotta-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-terracotta-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-terracotta-700"
                >
                  Go to login
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-teal-900/35">Amana - Trusted connections. Skilled hands.</p>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sand-50" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}