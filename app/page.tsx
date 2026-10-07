'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { searchArtisans, ArtisanSearchResult } from '@/lib/api/search';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/**
 * Only ids and image seeds live here. All visible text comes from
 * translations (catalog.<value> for the name, home.catDesc.<value> for the blurb).
 *
 * The `value` strings are the SAME ids the search page and the dashboard use,
 * so clicking a card now returns real results.
 */
const CATEGORIES = [
  { value: 'plumber', image: 'plumbing-pipes' },
  { value: 'electrician', image: 'electrical-wiring' },
  { value: 'solar', image: 'solar-panels' },
  { value: 'carpenter', image: 'carpentry-wood' },
  { value: 'tailor', image: 'tailoring-fabric' },
  { value: 'mechanic', image: 'auto-mechanic' },
  { value: 'painter', image: 'wall-painting' },
  { value: 'mason', image: 'masonry-brick' },
  { value: 'ac-technician', image: 'ac-repair' },
  { value: 'welder', image: 'welding-metal' },
  { value: 'cleaner', image: 'home-cleaning' },
  { value: 'phone-repair', image: 'phone-repair' },
];

const HOW_IT_WORKS = [
  { number: '01', key: 's1' },
  { number: '02', key: 's2' },
  { number: '03', key: 's3' },
  { number: '04', key: 's4' },
] as const;

const TRUST_POINTS = ['p1', 'p2', 'p3', 'p4'] as const;

const ARTISAN_BENEFITS = ['b1', 'b2', 'b3', 'b4'] as const;

export default function Home() {
  const { t, tOr } = useLanguage();

  const [artisans, setArtisans] = useState<ArtisanSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchArtisans({ latitude: 12.0, longitude: 8.5167, radiusKm: 50 })
      .then((data) => setArtisans(data))
      .catch(() => setArtisans([]))
      .finally(() => setLoading(false));
  }, []);

  const workPhotos = artisans
    .flatMap((artisan) =>
      (artisan.portfolioPhotos || []).map((url) => ({
        url,
        artisanId: artisan._id,
        trade: artisan.tradeCategory,
      }))
    )
    .slice(0, 8);

  /** Translates a trade id from the API; falls back to the raw value if unknown. */
  const tradeLabel = (trade?: string) =>
    trade ? tOr(`catalog.${trade}`, trade) : '';

  return (
    <main className="min-h-screen overflow-x-hidden bg-sand-50 text-teal-900">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-end select-none opacity-[0.03]"
          aria-hidden="true"
        >
          <p style={{ fontFamily: 'var(--font-display)' }} className="text-[26rem] font-bold leading-none text-teal-900 -mr-16">
            A
          </p>
        </div>

        <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-terracotta-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-20 lg:grid-cols-2 lg:gap-20 lg:pb-28 lg:pt-28">
          <div className="animate-fade-in-up">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-terracotta-600/20 bg-white px-4 py-2 shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-terracotta-600" />
              <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-terracotta-600">
                {t('home.hero.badge')}
              </span>
            </div>

            <h1 className="font-display max-w-3xl text-5xl leading-[1.05] text-teal-900 sm:text-6xl lg:text-7xl">
              {t('home.hero.title1')}
              <br />
              <span className="relative inline-block text-terracotta-600">{t('home.hero.title2')}</span>
              <br />
              {t('home.hero.title3')}
            </h1>

            <p className="mt-7 max-w-2xl font-body text-lg leading-8 text-teal-800/70 sm:text-xl">
              {t('home.hero.subtitle')}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/search"
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-terracotta-600 px-7 py-4 font-body font-bold text-white shadow-xl shadow-terracotta-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-terracotta-700 hover:shadow-2xl"
              >
                {t('home.hero.ctaFind')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">-&gt;</span>
              </Link>

              <Link
                href="#services"
                className="inline-flex items-center justify-center rounded-xl border-2 border-teal-900/10 bg-white px-7 py-4 font-body font-bold text-teal-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-900/20 hover:shadow-lg"
              >
                {t('home.hero.ctaExplore')}
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-teal-800/60">
              <div className="flex items-center gap-2">{t('home.hero.perk1')}</div>
              <div className="flex items-center gap-2">{t('home.hero.perk2')}</div>
              <div className="flex items-center gap-2">{t('home.hero.perk3')}</div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative mx-auto max-w-xl">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-3 shadow-2xl shadow-teal-900/10">
                <div className="relative h-[560px] overflow-hidden rounded-[1.5rem] bg-teal-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=85"
                    alt={t('home.hero.imageAlt')}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-950/90 via-teal-900/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <p className="font-body text-sm font-semibold uppercase tracking-[0.18em] text-gold-400">AMANA</p>
                    <h2 className="mt-2 font-display text-3xl text-white">{t('home.hero.cardTitle')}</h2>
                    <p className="mt-3 max-w-sm font-body text-sm leading-6 text-white/70">
                      {t('home.hero.cardText')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-12 bottom-14 hidden w-56 rounded-2xl border border-teal-900/5 bg-white p-5 shadow-2xl xl:block">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-body text-xs font-bold uppercase tracking-wider text-teal-800/50">{t('home.hero.popular')}</span>
                  <span className="rounded-full bg-gold-400/15 px-2 py-1 text-xs font-bold text-gold-500">{t('home.hero.nearby')}</span>
                </div>
                <p className="font-body font-bold text-teal-900">{t('catalog.plumber')}</p>
                <p className="font-body text-xs text-teal-800/50">{t('home.hero.findPlumbers')}</p>
              </div>

              <div className="absolute -right-8 top-16 hidden rounded-2xl border border-teal-900/5 bg-white px-5 py-4 shadow-2xl xl:block">
                <p className="font-body text-xs text-teal-800/50">{t('home.hero.startingLocation')}</p>
                <p className="font-body font-bold text-teal-900">{t('home.hero.kanoNigeria')}</p>
              </div>
            </div>
          </div>

          <div className="lg:hidden">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white bg-white p-2 shadow-xl">
              <div className="relative h-[380px] overflow-hidden rounded-[1.25rem] bg-teal-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80"
                  alt={t('home.hero.imageAlt')}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <p className="font-body text-xs font-bold uppercase tracking-widest text-gold-400">AMANA</p>
                  <h2 className="mt-2 font-display text-2xl text-white">{t('home.hero.mobileTitle')}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-20 border-y border-teal-900/5 bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-terracotta-600/20 bg-terracotta-50 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-terracotta-600" />
                <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-terracotta-600">
                  {t('home.services.badge')}
                </span>
              </div>
              <h2 className="font-display text-4xl leading-tight text-teal-900 sm:text-5xl">
                {t('home.services.title')}
              </h2>
              <p className="mt-5 font-body text-lg leading-8 text-teal-800/65">
                {t('home.services.subtitle')}
              </p>
            </div>
            <Link href="/search" className="group inline-flex items-center gap-2 font-body font-bold text-terracotta-600">
              {t('home.services.viewAll')}
              <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category, index) => {
              const label = t(`catalog.${category.value}`);

              return (
                <Link
                  key={category.value}
                  href={`/search?category=${encodeURIComponent(category.value)}`}
                  className="group relative overflow-hidden rounded-2xl border border-teal-900/8 bg-sand-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-terracotta-600/30 hover:bg-white hover:shadow-xl"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative -mx-6 -mt-6 mb-5 h-36 overflow-hidden rounded-t-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://picsum.photos/seed/amana-${category.image}/500/300`}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-900/40 to-transparent" />
                  </div>

                  <h3 className="font-display text-2xl text-teal-900">{label}</h3>
                  <p className="mt-2 font-body text-sm leading-6 text-teal-800/60">
                    {t(`home.catDesc.${category.value}`)}
                  </p>
                  <div className="mt-5 font-body text-sm font-bold text-terracotta-600">
                    {t('home.services.findCategory', { name: label.toLowerCase() })}
                  </div>

                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-terracotta-600 transition-all duration-300 group-hover:w-full" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEARBY ARTISANS */}
      <section className="bg-sand-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-white px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-teal-900" />
                <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
                  {t('home.nearby.badge')}
                </span>
              </div>
              <h2 className="font-display text-4xl text-teal-900 sm:text-5xl">{t('home.nearby.title')}</h2>
              <p className="mt-4 max-w-xl font-body text-lg leading-8 text-teal-800/65">
                {t('home.nearby.subtitle')}
              </p>
            </div>
            <Link href="/search" className="group inline-flex items-center gap-2 font-body font-bold text-terracotta-600">
              {t('home.nearby.browseAll')}
              <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-96 animate-pulse rounded-2xl bg-white" />
                  ))}
                </div>
              ) : artisans.length === 0 ? (
                <div className="rounded-2xl border border-teal-900/10 bg-white p-10 text-center shadow-sm">
                  <h3 className="mt-5 font-display text-2xl text-teal-900">{t('home.nearby.emptyTitle')}</h3>
                  <p className="mx-auto mt-3 max-w-md font-body leading-7 text-teal-800/60">
                    {t('home.nearby.emptyText')}
                  </p>
                  <Link
                    href="/search"
                    className="mt-6 inline-flex rounded-xl bg-teal-900 px-6 py-3 font-body font-bold text-white transition hover:bg-teal-800"
                  >
                    {t('home.nearby.explore')}
                  </Link>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {artisans.slice(0, 4).map((artisan) => (
                    <Link
                      key={artisan._id}
                      href={`/artisan/${artisan._id}`}
                      className="group overflow-hidden rounded-2xl border border-teal-900/8 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-terracotta-600/30 hover:shadow-xl"
                    >
                      <div className="relative h-52 overflow-hidden bg-sand-100">
                        {artisan.portfolioPhotos?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={artisan.portfolioPhotos[0]}
                            alt={tradeLabel(artisan.tradeCategory)}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-sand-100 via-white to-terracotta-50">
                            <span className="font-display text-3xl text-teal-900/30 capitalize">
                              {tradeLabel(artisan.tradeCategory)}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-teal-950/70 via-transparent to-transparent" />

                        <div className="absolute bottom-4 left-4">
                          <span className="rounded-full bg-white/95 px-3 py-1.5 font-body text-xs font-bold capitalize text-teal-900 shadow-lg">
                            {tradeLabel(artisan.tradeCategory)}
                          </span>
                        </div>

                        {artisan.verificationStatus === 'verified' && (
                          <div className="absolute right-4 top-4 rounded-full bg-teal-900/95 px-3 py-1.5 font-body text-xs font-bold text-white">
                            {t('home.nearby.verified')}
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="font-display text-xl capitalize text-teal-900">
                          {tradeLabel(artisan.tradeCategory)}
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {artisan.ratingAvg ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/10 px-2.5 py-1 font-body text-sm font-bold text-gold-500">
                              {artisan.ratingAvg.toFixed(1)}
                              <span className="font-normal text-teal-800/50">({artisan.ratingCount})</span>
                            </span>
                          ) : (
                            <span className="font-body text-xs italic text-teal-800/45">
                              {t('home.nearby.noReviews')}
                            </span>
                          )}
                          <span className="font-body text-xs text-teal-800/45">
                            {t('home.nearby.kmAway', {
                              km: (artisan.distanceMeters / 1000).toFixed(1),
                            })}
                          </span>
                        </div>

                        <div className="mt-5 border-t border-teal-900/8 pt-4 font-body text-sm font-bold text-terracotta-600">
                          {t('home.nearby.viewProfile')}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="relative min-h-[520px] overflow-hidden rounded-3xl bg-teal-900 shadow-xl flex items-center justify-center">
              <div className="relative text-center px-6">
                <p className="font-display text-2xl text-white mb-2">{t('home.nearby.mapTitle')}</p>
                <p className="font-body text-sm text-white/60">{t('home.nearby.mapSoon')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative scroll-mt-20 overflow-hidden bg-teal-900 py-24">
        <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-terracotta-600/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-gold-400" />
              <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
                {t('home.how.badge')}
              </span>
            </div>
            <h2 className="font-display text-4xl text-white sm:text-5xl">{t('home.how.title')}</h2>
            <p className="mt-5 font-body text-lg leading-8 text-white/60">
              {t('home.how.subtitle')}
            </p>
          </div>

          <div className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-9 hidden h-px bg-white/10 lg:block" />
            {HOW_IT_WORKS.map((step) => (
              <div key={step.number} className="relative">
                <div className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-terracotta-600 font-display text-xl text-white shadow-xl shadow-terracotta-600/20">
                  {step.number}
                </div>
                <div className="mt-7">
                  <h3 className="font-display text-2xl text-white">{t(`home.how.${step.key}Title`)}</h3>
                  <p className="mt-3 font-body leading-7 text-white/60">{t(`home.how.${step.key}Text`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORK GALLERY */}
      {workPhotos.length > 0 && (
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-sand-50 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-teal-900" />
                  <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
                    {t('home.gallery.badge')}
                  </span>
                </div>
                <h2 className="font-display text-4xl text-teal-900 sm:text-5xl">{t('home.gallery.title')}</h2>
                <p className="mt-5 font-body text-lg leading-8 text-teal-800/65">
                  {t('home.gallery.subtitle')}
                </p>
              </div>
              <Link href="/search" className="group inline-flex items-center gap-2 font-body font-bold text-terracotta-600">
                {t('home.gallery.explore')}
                <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {workPhotos.map((photo, index) => (
                <Link
                  key={`${photo.artisanId}-${index}`}
                  href={`/artisan/${photo.artisanId}`}
                  className={`group relative overflow-hidden rounded-2xl ${
                    index === 0 || index === 5 ? 'aspect-[4/5] md:row-span-2' : 'aspect-square'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={tradeLabel(photo.trade)}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-4 left-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="rounded-full bg-white/95 px-3 py-1.5 font-body text-xs font-bold capitalize text-teal-900">
                      {tradeLabel(photo.trade)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TRUST */}
      <section className="bg-sand-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-white px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-terracotta-600" />
              <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
                {t('home.trust.badge')}
              </span>
            </div>
            <h2 className="font-display text-4xl text-teal-900 sm:text-5xl">{t('home.trust.title')}</h2>
            <p className="mt-5 font-body text-lg leading-8 text-teal-800/65">
              {t('home.trust.subtitle')}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {TRUST_POINTS.map((key, i) => (
              <div
                key={key}
                className="group rounded-2xl border border-teal-900/8 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-900 font-display text-lg text-white group-hover:bg-terracotta-600 transition-colors mb-5">
                  {i + 1}
                </div>
                <h3 className="font-display text-2xl text-teal-900">{t(`home.trust.${key}Title`)}</h3>
                <p className="mt-3 font-body leading-7 text-teal-800/60">{t(`home.trust.${key}Text`)}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/safety" className="font-body text-sm font-bold text-terracotta-600">
              {t('home.trust.learnMore')}
            </Link>
          </div>
        </div>
      </section>

      {/* FOR ARTISANS */}
      <section className="px-6 py-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-teal-900 px-7 py-16 shadow-2xl sm:px-12 lg:px-20 lg:py-20">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-terracotta-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-gold-400" />
                <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
                  {t('home.forArtisans.badge')}
                </span>
              </div>

              <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl">
                {t('home.forArtisans.title')}
              </h2>

              <p className="mt-6 max-w-2xl font-body text-lg leading-8 text-white/65">
                {t('home.forArtisans.text')}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-terracotta-600 px-7 py-4 font-body font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-terracotta-700"
                >
                  {t('home.forArtisans.join')}
                </Link>
                <Link
                  href="/help"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-body font-bold text-white transition-all hover:bg-white/10"
                >
                  {t('home.forArtisans.learn')}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {ARTISAN_BENEFITS.map((key) => (
                <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <p className="font-body text-sm font-bold text-white">{t(`home.forArtisans.${key}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-teal-900/8 bg-white p-8 shadow-sm sm:p-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-terracotta-600/20 bg-terracotta-50 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-terracotta-600" />
              <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-terracotta-600">
                {t('home.where.badge')}
              </span>
            </div>
            <h2 className="font-display text-4xl text-teal-900">{t('home.where.title')}</h2>
            <p className="mt-4 max-w-2xl font-body text-lg leading-8 text-teal-800/60">
              {t('home.where.text')}
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-terracotta-600 py-24">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-teal-900/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-white/60">
            {t('home.cta.eyebrow')}
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
            {t('home.cta.title')}
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-body text-lg leading-8 text-white/75">
            {t('home.cta.text')}
          </p>
          <Link
            href="/search"
            className="group mt-9 inline-flex items-center gap-3 rounded-xl bg-teal-900 px-8 py-4 font-body text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-teal-800"
          >
            {t('home.cta.button')}
            <span className="transition-transform duration-300 group-hover:translate-x-1">-&gt;</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-teal-900">
        <div className="h-1 bg-gradient-to-r from-terracotta-600 via-gold-400 to-terracotta-600" />

        <div className="mx-auto max-w-7xl px-6 pb-10 pt-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta-600 shadow-lg shadow-terracotta-600/20">
                  <span className="font-display text-2xl font-bold text-white">A</span>
                </div>
                <span className="font-display text-3xl text-white">Amana</span>
              </Link>

              <p className="mt-5 max-w-sm font-body leading-7 text-white/50">
                {t('home.footer.tagline')}
              </p>

              <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 font-body text-xs text-white/50">
                {t('home.footer.region')}
              </div>
            </div>

            <div>
              <h3 className="font-body text-xs font-bold uppercase tracking-[0.18em] text-terracotta-400">{t('home.footer.customers')}</h3>
              <div className="mt-5 flex flex-col gap-3">
                <Link href="/search" className="font-body text-sm text-white/55 transition hover:translate-x-1 hover:text-white">{t('home.footer.findArtisans')}</Link>
                <Link href="/#how-it-works" className="font-body text-sm text-white/55 transition hover:translate-x-1 hover:text-white">{t('home.footer.howItWorks')}</Link>
                <Link href="/help" className="font-body text-sm text-white/55 transition hover:translate-x-1 hover:text-white">{t('home.footer.faqs')}</Link>
              </div>
            </div>

            <div>
              <h3 className="font-body text-xs font-bold uppercase tracking-[0.18em] text-gold-400">{t('home.footer.artisans')}</h3>
              <div className="mt-5 flex flex-col gap-3">
                <Link href="/register" className="font-body text-sm text-white/55 transition hover:translate-x-1 hover:text-white">{t('home.footer.becomeArtisan')}</Link>
                {/* /edit-profile does not exist; the profile editor lives in the dashboard. */}
                <Link href="/dashboard" className="font-body text-sm text-white/55 transition hover:translate-x-1 hover:text-white">{t('home.footer.buildProfile')}</Link>
                <Link href="/help" className="font-body text-sm text-white/55 transition hover:translate-x-1 hover:text-white">{t('home.footer.artisanFaqs')}</Link>
              </div>
            </div>

            <div>
              <h3 className="font-body text-xs font-bold uppercase tracking-[0.18em] text-white/70">{t('home.footer.support')}</h3>
              <div className="mt-5 flex flex-col gap-3">
                <Link href="/help" className="font-body text-sm text-white/55 transition hover:translate-x-1 hover:text-white">{t('home.footer.helpCenter')}</Link>
                <Link href="/safety" className="font-body text-sm text-white/55 transition hover:translate-x-1 hover:text-white">{t('home.footer.safety')}</Link>
                <Link href="/search" className="font-body text-sm text-white/55 transition hover:translate-x-1 hover:text-white">{t('home.footer.browse')}</Link>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-body text-sm text-white/35">{t('home.footer.rights')}</p>

            <div className="flex items-center gap-3">
              {['Instagram', 'Facebook', 'TikTok', 'LinkedIn'].map((platform) => (
                <span
                  key={platform}
                  title={t('home.footer.soon', { platform })}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 font-body text-xs font-bold text-white/35"
                >
                  {platform.charAt(0)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}