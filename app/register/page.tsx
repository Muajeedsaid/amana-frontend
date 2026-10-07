'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/api/auth';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [role, setRole] = useState<'customer' | 'artisan'>('customer');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [tradeCategory, setTradeCategory] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await registerUser(phone, password, role);
      localStorage.setItem('amana_token', data.accessToken);

      if (role === 'artisan') {
        await fetch(`${API_URL}/profiles/artisan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.accessToken}`,
          },
          body: JSON.stringify({
            tradeCategory: tradeCategory || 'general',
            longitude: 8.5167,
            latitude: 12.0,
          }),
        });
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-sand-50 px-5 py-8 sm:px-6">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-terracotta-500/10 blur-3xl" />
      <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-teal-900/10 blur-3xl" />

      <div className="absolute right-[8%] top-[15%] hidden rotate-12 select-none font-display text-[180px] font-bold leading-none text-teal-900/[0.025] lg:block">
        A
      </div>

      <div className="relative mx-auto w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-900 text-xl font-bold text-sand-50 shadow-lg transition-transform duration-300 hover:rotate-6">
              A
            </div>
            <span className="font-display text-3xl font-semibold text-teal-900">
              Amana
            </span>
          </Link>
          <p className="mt-3 text-sm text-teal-800/55">
            Trusted connections. Skilled hands.
          </p>
        </div>

        <div className="rounded-3xl border border-teal-900/10 bg-white/90 p-6 shadow-[0_25px_80px_rgba(10,60,60,0.12)] backdrop-blur-xl sm:p-9">
          <div className="mb-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-terracotta-600">
              {t('register.eyebrow')}
            </p>
            <h1 className="font-display text-3xl text-teal-900 sm:text-4xl">
              {t('register.title')}
            </h1>
            <p className="mt-2 text-sm text-teal-800/55">
              {t('register.subtitle')}
            </p>
          </div>

          <div className="mb-7">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-teal-800/60">
              {t('register.iWantTo')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`group rounded-2xl border p-4 text-left transition-all duration-300 ${
                  role === 'customer'
                    ? 'border-terracotta-500 bg-terracotta-500/5 shadow-md'
                    : 'border-teal-900/10 bg-sand-50 hover:border-teal-900/25 hover:-translate-y-0.5'
                }`}
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all ${
                    role === 'customer' ? 'bg-terracotta-600 text-white' : 'bg-teal-900/5 text-teal-900'
                  }`}
                >
                  ◎
                </div>
                <p className="text-sm font-semibold text-teal-900">{t('register.findService')}</p>
                <p className="mt-1 text-xs leading-5 text-teal-800/50">
                  {t('register.findServiceDesc')}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('artisan')}
                className={`group rounded-2xl border p-4 text-left transition-all duration-300 ${
                  role === 'artisan'
                    ? 'border-terracotta-500 bg-terracotta-500/5 shadow-md'
                    : 'border-teal-900/10 bg-sand-50 hover:border-teal-900/25 hover:-translate-y-0.5'
                }`}
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all ${
                    role === 'artisan' ? 'bg-terracotta-600 text-white' : 'bg-teal-900/5 text-teal-900'
                  }`}
                >
                  ✦
                </div>
                <p className="text-sm font-semibold text-teal-900">{t('register.offerSkills')}</p>
                <p className="mt-1 text-xs leading-5 text-teal-800/50">
                  {t('register.offerSkillsDesc')}
                </p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-teal-900">
                {t('register.phoneLabel')}
              </label>
              <div className="group relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-teal-800/35">
                  ☎
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder={t('register.phonePlaceholder')}
                  className="w-full rounded-xl border border-teal-900/15 bg-sand-50/60 px-11 py-3.5 text-sm text-teal-900 outline-none transition-all duration-300 placeholder:text-teal-900/25 focus:border-terracotta-500 focus:bg-white focus:ring-4 focus:ring-terracotta-500/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-teal-900">
                {t('register.passwordLabel')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={t('register.passwordPlaceholder')}
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

            {role === 'artisan' && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                <label className="mb-2 block text-sm font-medium text-teal-900">
                  {t('register.tradeLabel')}
                </label>
                <input
                  type="text"
                  value={tradeCategory}
                  onChange={(e) => setTradeCategory(e.target.value)}
                  required
                  placeholder={t('register.tradePlaceholder')}
                  className="w-full rounded-xl border border-teal-900/15 bg-sand-50/60 px-4 py-3.5 text-sm text-teal-900 outline-none transition-all duration-300 placeholder:text-teal-900/25 focus:border-terracotta-500 focus:bg-white focus:ring-4 focus:ring-terracotta-500/10"
                />
                <p className="mt-2 text-xs text-teal-800/45">
                  {t('register.tradeHint')}
                </p>
              </div>
            )}

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
                    {t('register.creatingAccount')}
                  </>
                ) : (
                  <>
                    {t('register.createAccount')}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="my-7 h-px bg-teal-900/10" />

          <p className="text-center text-sm text-teal-800/55">
            {t('register.alreadyHaveAccount')}{' '}
            <Link href="/login" className="font-semibold text-terracotta-600 transition hover:text-terracotta-700 hover:underline">
              {t('register.logIn')}
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-teal-900/35">
          {t('register.terms')}
        </p>
      </div>
    </main>
  );
}