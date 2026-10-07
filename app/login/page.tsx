'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/api/auth';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(phone, password);

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
          // Don't block login if profile already exists.
        } finally {
          localStorage.removeItem('amana_pending_trade');
        }
      }

      if (data.user.role === 'admin') {
        router.push('/admin');
      } else if (data.user.role === 'artisan') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-sand-50 flex items-center justify-center px-5 py-10">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-teal-900/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-terracotta-500/10 blur-3xl" />
      <div className="absolute left-[8%] top-[18%] hidden select-none font-display text-[180px] font-bold leading-none text-teal-900/[0.025] lg:block">
        A
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-900 text-xl font-bold text-sand-50 shadow-lg transition-transform duration-300 hover:-rotate-6">
              A
            </div>
            <span className="font-display text-3xl font-semibold text-teal-900">
              Amana
            </span>
          </Link>
          <p className="mt-3 text-sm text-teal-800/55">
            Welcome back to trusted connections.
          </p>
        </div>

        <div className="rounded-3xl border border-teal-900/10 bg-white/90 p-7 shadow-[0_25px_80px_rgba(10,60,60,0.12)] backdrop-blur-xl sm:p-10">
          <div className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-terracotta-600">
              {t('login.eyebrow')}
            </p>
            <h1 className="font-display text-3xl text-teal-900 sm:text-4xl">
              {t('login.title')}
            </h1>
            <p className="mt-2 text-sm text-teal-800/55">
              {t('login.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-teal-900">
                {t('login.phoneLabel')}
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-teal-800/35">
                  ☎
                </span>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder={t('login.phonePlaceholder')}
                  className="w-full rounded-xl border border-teal-900/15 bg-sand-50/60 px-11 py-3.5 text-sm text-teal-900 outline-none transition-all duration-300 placeholder:text-teal-900/25 focus:border-terracotta-500 focus:bg-white focus:ring-4 focus:ring-terracotta-500/10"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-teal-900">
                  {t('login.passwordLabel')}
                </label>

                <button
                  type="button"
                  className="text-xs font-medium text-terracotta-600 transition hover:text-terracotta-700 hover:underline"
                  onClick={() => setError(t('login.resetSoon'))}
                >
                  {t('login.forgotPassword')}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-teal-900/15 bg-sand-50/60 px-4 py-3.5 pr-12 text-sm text-teal-900 outline-none transition-all duration-300 placeholder:text-teal-900/25 focus:border-terracotta-500 focus:bg-white focus:ring-4 focus:ring-terracotta-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-teal-800/45 transition hover:bg-teal-900/5 hover:text-teal-900"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-[fadeIn_0.25s_ease-out]">
                <span className="mt-0.5">!</span>
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-terracotta-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-terracotta-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-terracotta-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t('login.signingIn')}
                  </>
                ) : (
                  <>
                    {t('login.signIn')}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="my-7 h-px bg-teal-900/10" />

          <p className="text-center text-sm text-teal-800/55">
            {t('login.noAccount')}{' '}
            <Link href="/register" className="font-semibold text-terracotta-600 transition hover:text-terracotta-700 hover:underline">
              {t('login.createAccount')}
            </Link>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-teal-900/40">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-900/5">
            ✓
          </span>
          {t('login.protectedNotice')}
        </div>
      </div>
    </main>
  );
}