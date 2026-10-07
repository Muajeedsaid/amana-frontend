'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { searchArtisans, ArtisanSearchResult } from '@/lib/api/search';
import { createBooking } from '@/lib/api/bookings';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type SortOption = 'recommended' | 'distance' | 'rating';

type LocationKey = '' | 'unsupported' | 'ready' | 'failed';

/**
 * Ids and symbols only. Names come from `catalog.<value>`,
 * blurbs from `search.desc.<value>`, group titles from `catalog.groups.<group>`.
 */
const SERVICE_GROUPS: { group: string; options: { value: string; symbol: string }[] }[] = [
  {
    group: 'Home & building',
    options: [
      { value: 'plumber', symbol: 'P' },
      { value: 'electrician', symbol: 'E' },
      { value: 'solar', symbol: 'S' },
      { value: 'carpenter', symbol: 'C' },
      { value: 'mason', symbol: 'M' },
      { value: 'painter', symbol: 'P' },
      { value: 'welder', symbol: 'W' },
      { value: 'ac-technician', symbol: 'A' },
      { value: 'cleaner', symbol: 'C' },
    ],
  },
  {
    group: 'Technology',
    options: [
      { value: 'phone-repair', symbol: 'P' },
      { value: 'computer-repair', symbol: 'C' },
      { value: 'cctv', symbol: 'S' },
      { value: 'generator-repair', symbol: 'G' },
    ],
  },
  {
    group: 'Personal',
    options: [
      { value: 'tailor', symbol: 'T' },
      { value: 'barber', symbol: 'B' },
    ],
  },
  {
    group: 'Vehicles',
    options: [
      { value: 'mechanic', symbol: 'M' },
      { value: 'panel-beater', symbol: 'P' },
    ],
  },
  {
    group: 'Products',
    options: [
      { value: 'phones', symbol: 'P' },
      { value: 'phone-accessories', symbol: 'P' },
      { value: 'computers', symbol: 'C' },
      { value: 'computer-accessories', symbol: 'C' },
      { value: 'electronics', symbol: 'E' },
      { value: 'shoes', symbol: 'S' },
      { value: 'clothing', symbol: 'C' },
      { value: 'furniture', symbol: 'F' },
      { value: 'building-materials', symbol: 'B' },
      { value: 'solar-equipment', symbol: 'S' },
      { value: 'spare-parts', symbol: 'V' },
    ],
  },
];

const ALL_SERVICE_VALUES = SERVICE_GROUPS.flatMap((g) => g.options.map((o) => o.value));

const DISTANCE_OPTIONS = [2, 5, 10, 25, 50];
const RATING_OPTIONS = [4, 4.5];

// Only this many artisans are shown at first, to keep the page short.
const INITIAL_ARTISAN_COUNT = 6;

const DEFAULT_COORDS = { latitude: '12.0', longitude: '8.5167' };

function SearchPageContent() {
  const params = useSearchParams();
  const { t, tOr } = useLanguage();

  const [category, setCategory] = useState(params.get('category') || '');
  const [radiusKm, setRadiusKm] = useState(10);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortOption>('recommended');

  const [latitude, setLatitude] = useState(DEFAULT_COORDS.latitude);
  const [longitude, setLongitude] = useState(DEFAULT_COORDS.longitude);

  const [results, setResults] = useState<ArtisanSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const [searched, setSearched] = useState(false);

  const [bookingArtisanId, setBookingArtisanId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookedIds, setBookedIds] = useState<string[]>([]);

  const [locationLoading, setLocationLoading] = useState(false);
  // Stored as a key (not text) so the message re-translates when the language is switched.
  const [locationKey, setLocationKey] = useState<LocationKey>('');

  const [showAllArtisans, setShowAllArtisans] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* =========================================================
     SEARCH
     `coords` lets callers pass fresh coordinates directly.
     Reading `latitude`/`longitude` state right after setting
     it would use the OLD values (state updates are async).
  ========================================================= */

  async function runSearch(
    cat: string,
    radius: number,
    coords?: { latitude: number; longitude: number }
  ) {
    setLoading(true);
    setSearchFailed(false);
    setShowAllArtisans(false);

    try {
      const data = await searchArtisans({
        longitude: coords?.longitude ?? parseFloat(longitude),
        latitude: coords?.latitude ?? parseFloat(latitude),
        category: cat || undefined,
        radiusKm: radius,
      });

      setResults(data);
      setSearched(true);
    } catch (err) {
      console.error(err);
      setSearchFailed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch(params.get('category') || '', radiusKm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterSearch() {
    setFiltersOpen(false);
    runSearch(category, radiusKm);
  }

  function clearFilters() {
    setCategory('');
    setRadiusKm(50);
    setMinRating(0);
    setSort('recommended');
    setShowAllArtisans(false);
    runSearch('', 50);
  }

  /* =========================================================
     LOCATION
  ========================================================= */

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationKey('unsupported');
      return;
    }

    setLocationLoading(true);
    setLocationKey('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        setLatitude(lat.toString());
        setLongitude(lng.toString());
        setLocationLoading(false);
        setLocationKey('ready');

        runSearch(category, radiusKm, { latitude: lat, longitude: lng });
      },
      () => {
        setLocationLoading(false);
        setLocationKey('failed');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  /* =========================================================
     BOOKING
  ========================================================= */

  function openBookingForm(artisanId: string) {
    setBookingArtisanId(artisanId);
    setDescription('');
    setBookingError('');
  }

  async function handleBookingSubmit(e: React.FormEvent, artisanProfileId: string) {
    e.preventDefault();

    if (!description.trim()) {
      setBookingError(t('search.errors.describeJob'));
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      await createBooking({ artisanProfileId, description: description.trim() });

      setBookedIds((previous) => [...previous, artisanProfileId]);
      setBookingArtisanId(null);
      setDescription('');
    } catch (err: any) {
      // Server messages are English; fall back to a translated generic one.
      setBookingError(err?.message || t('search.errors.bookingFailed'));
    } finally {
      setBookingLoading(false);
    }
  }

  /* =========================================================
     FILTER RESULTS
  ========================================================= */

  const filteredResults = useMemo(() => {
    return results
      .filter((a) => !minRating || (a.ratingAvg && a.ratingAvg >= minRating))
      .sort((a, b) => {
        if (sort === 'distance') return a.distanceMeters - b.distanceMeters;
        if (sort === 'rating') return (b.ratingAvg || 0) - (a.ratingAvg || 0);
        return 0;
      });
  }, [results, minRating, sort]);

  const totalResults = filteredResults.length;

  const visibleResults = showAllArtisans
    ? filteredResults
    : filteredResults.slice(0, INITIAL_ARTISAN_COUNT);

  const hasMoreArtisans = totalResults > INITIAL_ARTISAN_COUNT;
  const shownCount = Math.min(INITIAL_ARTISAN_COUNT, totalResults);

  const selectedLabel = ALL_SERVICE_VALUES.includes(category)
    ? t(`catalog.${category}`)
    : '';

  const tradeLabel = (trade?: string) => {
  if (!trade) return '';

  const labels: Record<string, string> = {
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    solar: 'Solar & Inverters',
    carpentry: 'Carpentry',
    masonry: 'Masonry',
    painting: 'Painting',
    welding: 'Welding',
    'ac-refrigeration': 'AC & Refrigeration',
    cleaning: 'Cleaning',
    'phone-repair': 'Phone Repair',
    'computer-repair': 'Computer Repair',
    'cctv-security': 'CCTV & Security',
    'generator-repair': 'Generator Repair',
    tailoring: 'Tailoring',
    barbing: 'Barbing & Grooming',
    'auto-repair': 'Auto Repair',
    'panel-beating': 'Panel Beating',
  };

  return labels[trade.toLowerCase()] || trade;
};

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-sand-50 text-teal-900">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-teal-900/10 bg-white">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-terracotta-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-teal-700/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-terracotta-600/20 bg-terracotta-50 px-4 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-terracotta-600" />
              <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-terracotta-600">
                {t('search.hero.badge')}
              </span>
            </div>

            <h1 className="font-display text-4xl leading-tight text-teal-950 sm:text-5xl lg:text-6xl">
              {t('search.hero.title1')}
              <span className="block text-terracotta-600">{t('search.hero.title2')}</span>
            </h1>

            <p className="mt-5 max-w-2xl font-body text-base leading-7 text-teal-900/65 sm:text-lg">
              {t('search.hero.subtitle')}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locationLoading}
                className="group inline-flex items-center justify-center gap-3 rounded-xl border border-teal-900/15 bg-white px-5 py-3.5 font-body text-sm font-semibold text-teal-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-900/30 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-900 text-xs font-bold text-white">
                  {locationLoading ? '...' : '⌖'}
                </span>
                {locationLoading ? t('search.hero.finding') : t('search.hero.useLocation')}
              </button>

              <span className="font-body text-sm text-teal-900/50">
                {t('search.hero.orKano')}
              </span>
            </div>

            {locationKey && (
              <p className="mt-3 font-body text-sm text-teal-900/60">
                {t(`search.location.${locationKey}`)}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* MOBILE FILTER BUTTON */}
        <button
          type="button"
          onClick={() => setFiltersOpen((previous) => !previous)}
          className="mb-5 flex w-full items-center justify-between rounded-2xl border border-teal-900/10 bg-white px-5 py-4 shadow-sm lg:hidden"
        >
          <span>
            <span className="block font-display text-lg text-teal-950">
              {t('search.filters.toggleTitle')}
            </span>
            <span className="mt-1 block font-body text-xs text-teal-900/50">
              {t('search.filters.toggleSub')}
            </span>
          </span>

          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-900 text-sm font-bold text-white">
            {filtersOpen ? '−' : '+'}
          </span>
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* FILTER SIDEBAR */}
          <aside
            className={`h-fit rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm ${
              filtersOpen ? 'block' : 'hidden lg:block'
            } lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto`}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="font-display text-xl text-teal-950">{t('search.filters.refine')}</p>
                <p className="mt-1 font-body text-xs text-teal-900/50">
                  {t('search.filters.findBetter')}
                </p>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="font-body text-xs font-semibold text-terracotta-600 transition-colors hover:text-terracotta-700"
              >
                {t('search.filters.clear')}
              </button>
            </div>

            {/* SERVICE */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="font-body text-sm font-bold text-teal-950">
                  {t('search.filters.service')}
                </p>

                {selectedLabel && (
                  <span className="font-body text-xs text-terracotta-600">{selectedLabel}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setCategory('')}
                className={`mb-4 flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                  category === ''
                    ? 'border-terracotta-600 bg-terracotta-50 shadow-sm'
                    : 'border-transparent hover:border-teal-900/10 hover:bg-sand-50'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    category === ''
                      ? 'bg-terracotta-600 text-white'
                      : 'bg-teal-900/5 text-teal-900'
                  }`}
                >
                  A
                </span>

                <span>
                  <span className="block font-body text-sm font-semibold text-teal-900">
                    {t('search.filters.allServices')}
                  </span>
                  <span className="block font-body text-xs text-teal-900/45">
                    {t('search.filters.allServicesSub')}
                  </span>
                </span>
              </button>

              <div className="space-y-5">
                {SERVICE_GROUPS.map((group) => (
                  <div key={group.group}>
                    <p className="mb-2 font-body text-xs font-bold uppercase tracking-[0.14em] text-teal-900/35">
                      {t(`catalog.groups.${group.group}`)}
                    </p>

                    <div className="space-y-2">
                      {group.options.map((service) => {
                        const active = category === service.value;

                        return (
                          <button
                            key={service.value}
                            type="button"
                            onClick={() => setCategory(service.value)}
                            className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                              active
                                ? 'border-terracotta-600 bg-terracotta-50 shadow-sm'
                                : 'border-transparent hover:border-teal-900/10 hover:bg-sand-50'
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                active
                                  ? 'bg-terracotta-600 text-white'
                                  : 'bg-teal-900/5 text-teal-900'
                              }`}
                            >
                              {service.symbol}
                            </span>

                            <span className="min-w-0">
                              <span className="block font-body text-sm font-semibold text-teal-900">
                                {t(`catalog.${service.value}`)}
                              </span>
                              <span className="block truncate font-body text-xs text-teal-900/45">
                                {t(`search.desc.${service.value}`)}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DISTANCE */}
            <div className="mt-7 border-t border-teal-900/10 pt-6">
              <p className="mb-3 font-body text-sm font-bold text-teal-950">
                {t('search.filters.distance')}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {DISTANCE_OPTIONS.map((distance) => {
                  const active = radiusKm === distance;

                  return (
                    <button
                      key={distance}
                      type="button"
                      onClick={() => setRadiusKm(distance)}
                      className={`rounded-lg border px-3 py-2.5 font-body text-xs font-semibold transition-all ${
                        active
                          ? 'border-terracotta-600 bg-terracotta-50 text-terracotta-600'
                          : 'border-teal-900/10 text-teal-900/60 hover:border-teal-900/20 hover:bg-sand-50'
                      }`}
                    >
                      {t('search.filters.underKm', { km: distance })}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RATING */}
            <div className="mt-7 border-t border-teal-900/10 pt-6">
              <p className="mb-3 font-body text-sm font-bold text-teal-950">
                {t('search.filters.minRating')}
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setMinRating(0)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-body text-sm ${
                    minRating === 0 ? 'bg-teal-900 text-white' : 'text-teal-900/60 hover:bg-sand-50'
                  }`}
                >
                  <span>{t('search.filters.anyRating')}</span>
                  {minRating === 0 && <span>✓</span>}
                </button>

                {RATING_OPTIONS.map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setMinRating(rating)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-body text-sm ${
                      minRating === rating
                        ? 'bg-teal-900 text-white'
                        : 'text-teal-900/60 hover:bg-sand-50'
                    }`}
                  >
                    <span>
                      <span className="text-gold-500">★</span> {rating}+
                    </span>
                    {minRating === rating && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* APPLY */}
            <button
              type="button"
              onClick={handleFilterSearch}
              disabled={loading}
              className="mt-7 w-full rounded-xl bg-terracotta-600 px-5 py-3.5 font-body text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-terracotta-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t('search.filters.searching') : t('search.filters.apply')}
            </button>
          </aside>

          {/* RESULTS */}
          <div className="min-w-0">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-body text-sm text-teal-900/50">
                  {selectedLabel
                    ? t('search.results.offering', { service: selectedLabel })
                    : t('search.results.availableNear')}
                </p>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-3xl text-teal-950">
                    {loading ? '—' : totalResults}
                  </span>

                  <span className="font-body text-sm text-teal-900/55">
                    {totalResults === 1
                      ? t('search.results.foundOne')
                      : t('search.results.foundMany')}
                  </span>
                </div>

                {!loading && hasMoreArtisans && (
                  <p className="mt-1 font-body text-xs text-teal-900/45">
                    {t('search.results.showing', {
                      shown: showAllArtisans ? totalResults : shownCount,
                      total: totalResults,
                    })}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="font-body text-xs font-semibold uppercase tracking-wider text-teal-900/45">
                  {t('search.results.sort')}
                </label>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="rounded-xl border border-teal-900/10 bg-white px-4 py-3 font-body text-sm font-medium text-teal-900 shadow-sm outline-none transition focus:border-terracotta-600"
                >
                  <option value="recommended">{t('search.results.recommended')}</option>
                  <option value="distance">{t('search.results.nearest')}</option>
                  <option value="rating">{t('search.results.highestRated')}</option>
                </select>
              </div>
            </div>

            {/* ERROR */}
            {searchFailed && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-body text-sm font-semibold text-red-700">
                  {t('search.errors.searchFailed')}
                </p>

                <button
                  type="button"
                  onClick={handleFilterSearch}
                  className="mt-3 font-body text-sm font-bold text-red-700 underline"
                >
                  {t('search.results.tryAgain')}
                </button>
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-teal-900/10 bg-white p-5"
                  >
                    <div className="flex gap-4">
                      <div className="h-16 w-16 rounded-xl bg-teal-900/10" />
                      <div className="flex-1">
                        <div className="h-4 w-1/3 rounded bg-teal-900/10" />
                        <div className="mt-3 h-3 w-1/2 rounded bg-teal-900/10" />
                        <div className="mt-3 h-3 w-1/4 rounded bg-teal-900/10" />
                      </div>
                    </div>
                    <div className="mt-6 h-10 w-32 rounded-xl bg-teal-900/10" />
                  </div>
                ))}
              </div>
            )}

            {/* EMPTY */}
            {searched && !loading && filteredResults.length === 0 && !searchFailed && (
              <div className="rounded-3xl border border-dashed border-teal-900/15 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-900 text-lg font-bold text-white">
                  ?
                </div>

                <h2 className="mt-5 font-display text-2xl text-teal-950">
                  {t('search.results.emptyTitle')}
                </h2>

                <p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-teal-900/55">
                  {t('search.results.emptyText')}
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-terracotta-600 px-5 py-3 font-body text-sm font-bold text-white transition hover:bg-terracotta-700"
                >
                  {t('search.results.reset')}
                </button>
              </div>
            )}

            {/* ARTISAN CARDS */}
            {!loading && visibleResults.length > 0 && (
              <div className="space-y-4">
                {visibleResults.map((artisan, index) => {
                  const trade = tradeLabel(artisan.tradeCategory);
                  const displayName =
                    artisan.businessName ||
                    artisan.fullName ||
                    trade ||
                    t('search.card.professional');

                  return (
                    <article
                      key={artisan._id}
                      className="group relative overflow-hidden rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-terracotta-600/30 hover:shadow-xl sm:p-6"
                      style={{
                        animation: 'fadeUp 0.5s ease both',
                        animationDelay: `${index * 60}ms`,
                      }}
                    >
                      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-terracotta-600/5 transition-transform duration-500 group-hover:scale-150" />

                      <div className="relative">
                        {/* TOP */}
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                          <Link
                            href={`/artisan/${artisan._id}`}
                            className="flex min-w-0 items-start gap-4"
                          >
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-teal-900 text-lg font-display font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                              {artisan.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={artisan.avatarUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                (displayName[0] || 'A').toUpperCase()
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="font-display text-xl capitalize text-teal-950 transition-colors group-hover:text-terracotta-600">
                                  {displayName}
                                </h2>

                                {artisan.verificationStatus === 'verified' && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-900 px-2.5 py-1 font-body text-[11px] font-bold text-white">
                                    <span>✓</span>
                                    {t('search.card.verified')}
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 font-body text-sm capitalize text-teal-900/50">
                                {trade || t('search.card.professional')}
                              </p>

                              <p className="mt-2 font-body text-sm font-semibold text-terracotta-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                {t('search.card.viewProfileArrow')}
                              </p>
                            </div>
                          </Link>

                          {/* RATING */}
                          <div className="shrink-0">
                            {artisan.ratingAvg ? (
                              <div className="inline-flex items-center gap-2 rounded-xl bg-gold-400/10 px-3 py-2">
                                <span className="text-gold-500">★</span>
                                <span className="font-body text-sm font-bold text-teal-900">
                                  {artisan.ratingAvg.toFixed(1)}
                                </span>
                                <span className="font-body text-xs text-teal-900/45">
                                  ({artisan.ratingCount})
                                </span>
                              </div>
                            ) : (
                              <span className="font-body text-xs italic text-teal-900/40">
                                {t('search.card.noReviews')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* META */}
                        <div className="mt-5 flex flex-wrap gap-2">
                          <span className="rounded-lg bg-sand-50 px-3 py-2 font-body text-xs font-semibold text-teal-900/65">
                            ⌖{' '}
                            {t('search.card.kmAway', {
                              km: (artisan.distanceMeters / 1000).toFixed(1),
                            })}
                          </span>

                          <span className="rounded-lg bg-sand-50 px-3 py-2 font-body text-xs font-semibold capitalize text-teal-900/65">
                            {trade}
                          </span>

                          {artisan.isAvailable !== false && (
                            <span className="inline-flex items-center gap-2 rounded-lg bg-teal-900/5 px-3 py-2 font-body text-xs font-semibold text-teal-900">
                              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                              {t('search.card.available')}
                            </span>
                          )}
                        </div>

                        {/* BOOKING */}
                        <div className="mt-5 border-t border-teal-900/10 pt-5">
                          {bookedIds.includes(artisan._id) ? (
                            <div className="flex items-center gap-3 rounded-xl bg-teal-900/5 px-4 py-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-900 text-sm text-white">
                                ✓
                              </span>

                              <div>
                                <p className="font-body text-sm font-bold text-teal-900">
                                  {t('search.card.bookingSent')}
                                </p>
                                <p className="font-body text-xs text-teal-900/50">
                                  {t('search.card.bookingSentSub')}
                                </p>
                              </div>
                            </div>
                          ) : bookingArtisanId === artisan._id ? (
                            <form
                              onSubmit={(e) => handleBookingSubmit(e, artisan._id)}
                              className="rounded-2xl bg-sand-50 p-4"
                            >
                              <div className="mb-3">
                                <label className="font-body text-sm font-bold text-teal-950">
                                  {t('search.card.whatNeeded')}
                                </label>
                                <p className="mt-1 font-body text-xs text-teal-900/50">
                                  {t('search.card.giveInfo')}
                                </p>
                              </div>

                              <textarea
                                required
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('search.card.placeholder')}
                                className="w-full resize-none rounded-xl border border-teal-900/10 bg-white px-4 py-3 font-body text-sm text-teal-900 outline-none transition focus:border-terracotta-600 focus:ring-2 focus:ring-terracotta-600/10"
                              />

                              {bookingError && (
                                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 font-body text-xs font-semibold text-red-700">
                                  {bookingError}
                                </p>
                              )}

                              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                <button
                                  type="submit"
                                  disabled={bookingLoading}
                                  className="rounded-xl bg-terracotta-600 px-5 py-3 font-body text-sm font-bold text-white transition-all hover:bg-terracotta-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {bookingLoading
                                    ? t('search.card.sending')
                                    : t('search.card.send')}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setBookingArtisanId(null)}
                                  className="rounded-xl border border-teal-900/15 bg-white px-5 py-3 font-body text-sm font-semibold text-teal-900 transition hover:border-teal-900/30"
                                >
                                  {t('search.card.cancel')}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex flex-col gap-3 sm:flex-row">
                              <Link
                                href={`/artisan/${artisan._id}`}
                                className="inline-flex items-center justify-center rounded-xl border border-teal-900/15 px-5 py-3 font-body text-sm font-bold text-teal-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-900/30 hover:bg-sand-50"
                              >
                                {t('search.card.viewProfile')}
                              </Link>

                              <button
                                type="button"
                                onClick={() => openBookingForm(artisan._id)}
                                className="inline-flex items-center justify-center rounded-xl bg-terracotta-600 px-5 py-3 font-body text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-terracotta-700 hover:shadow-lg"
                              >
                                {t('search.card.requestBooking')}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* SHOW MORE / LESS */}
            {!loading && hasMoreArtisans && (
              <div className="mt-8 flex flex-col items-center">
                {!showAllArtisans ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowAllArtisans(true)}
                      className="group inline-flex items-center gap-3 rounded-xl border border-teal-900/15 bg-white px-7 py-3.5 font-body text-sm font-bold text-teal-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-terracotta-600/40 hover:text-terracotta-600 hover:shadow-md"
                    >
                      <span>{t('search.more.showAll', { total: totalResults })}</span>
                      <span className="transition-transform duration-300 group-hover:translate-y-0.5">
                        ↓
                      </span>
                    </button>

                    <p className="mt-3 text-center font-body text-xs text-teal-900/45">
                      {t('search.more.showFirst', { shown: shownCount })}
                    </p>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAllArtisans(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group inline-flex items-center gap-3 rounded-xl border border-teal-900/15 bg-white px-7 py-3.5 font-body text-sm font-bold text-teal-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-terracotta-600/40 hover:text-terracotta-600 hover:shadow-md"
                    >
                      <span>{t('search.more.showFewer')}</span>
                      <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
                        ↑
                      </span>
                    </button>

                    <p className="mt-3 text-center font-body text-xs text-teal-900/45">
                      {t('search.more.showingAll', { total: totalResults })}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* MAP PLACEHOLDER */}
            <div className="relative mt-10 overflow-hidden rounded-3xl border border-teal-900/10 bg-teal-950 p-7 shadow-sm sm:p-10">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-terracotta-600/10 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-terracotta-400">
                      {t('search.map.badge')}
                    </span>

                    <h2 className="mt-2 font-display text-2xl text-white sm:text-3xl">
                      {t('search.map.title')}
                    </h2>

                    <p className="mt-2 max-w-xl font-body text-sm leading-6 text-white/55">
                      {t('search.map.text')}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                    <p className="font-body text-xs uppercase tracking-wider text-white/40">
                      {t('search.map.radius')}
                    </p>
                    <p className="mt-1 font-display text-2xl text-white">{radiusKm} km</p>
                  </div>
                </div>

                <div className="mt-8 flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03]">
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                      ⌖
                    </div>

                    <p className="mt-3 font-body text-sm font-semibold text-white/80">
                      {t('search.map.soonTitle')}
                    </p>
                    <p className="mt-1 font-body text-xs text-white/40">
                      {t('search.map.soonText')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sand-50" />}>
      <SearchPageContent />
    </Suspense>
  );
}