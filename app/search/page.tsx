'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
  searchArtisans,
  ArtisanSearchResult,
} from '@/lib/api/search';

import { createBooking } from '@/lib/api/bookings';

type SortOption = 'recommended' | 'distance' | 'rating';

type ServiceOption = {
  value: string;
  label: string;
  description: string;
  symbol: string;
};

type ServiceGroup = {
  group: string;
  options: ServiceOption[];
};

/* =========================================================
   SERVICE CATALOG
========================================================= */

const SERVICE_GROUPS: ServiceGroup[] = [
  {
    group: 'Home & building',
    options: [
      {
        value: 'plumber',
        label: 'Plumbing',
        description: 'Pipes, leaks, water systems',
        symbol: 'P',
      },
      {
        value: 'electrician',
        label: 'Electrical',
        description: 'Wiring, power & repairs',
        symbol: 'E',
      },
      {
        value: 'solar',
        label: 'Solar & inverters',
        description: 'Solar systems & installation',
        symbol: 'S',
      },
      {
        value: 'carpenter',
        label: 'Carpentry',
        description: 'Furniture & woodwork',
        symbol: 'C',
      },
      {
        value: 'mason',
        label: 'Masonry',
        description: 'Blockwork, tiling, foundations',
        symbol: 'M',
      },
      {
        value: 'painter',
        label: 'Painting',
        description: 'Interior & exterior painting',
        symbol: 'P',
      },
      {
        value: 'welder',
        label: 'Welding',
        description: 'Gates, frames, metalwork',
        symbol: 'W',
      },
      {
        value: 'ac-technician',
        label: 'AC & refrigeration',
        description: 'Installation & repair',
        symbol: 'A',
      },
      {
        value: 'cleaner',
        label: 'Cleaning',
        description: 'Home & office cleaning',
        symbol: 'C',
      },
    ],
  },
  {
    group: 'Technology',
    options: [
      {
        value: 'phone-repair',
        label: 'Phone repair',
        description: 'Screen, battery & software fixes',
        symbol: 'P',
      },
      {
        value: 'computer-repair',
        label: 'Computer repair',
        description: 'Laptops, desktops & software',
        symbol: 'C',
      },
      {
        value: 'cctv',
        label: 'CCTV & security',
        description: 'Installation & maintenance',
        symbol: 'S',
      },
      {
        value: 'generator-repair',
        label: 'Generator repair',
        description: 'Servicing & fault repair',
        symbol: 'G',
      },
    ],
  },
  {
    group: 'Personal',
    options: [
      {
        value: 'tailor',
        label: 'Tailoring',
        description: 'Clothing & alterations',
        symbol: 'T',
      },
      {
        value: 'barber',
        label: 'Barbing & grooming',
        description: 'Haircuts & grooming',
        symbol: 'B',
      },
    ],
  },
  {
    group: 'Vehicles',
    options: [
      {
        value: 'mechanic',
        label: 'Auto repair',
        description: 'Vehicle repairs',
        symbol: 'M',
      },
      {
        value: 'panel-beater',
        label: 'Panel beating',
        description: 'Bodywork & dent repair',
        symbol: 'P',
      },
    ],
  },
  {
    group: 'Products',
    options: [
      {
        value: 'phones',
        label: 'Phones',
        description: 'New & used phones for sale',
        symbol: 'P',
      },
      {
        value: 'phone-accessories',
        label: 'Phone accessories',
        description: 'Cases, chargers & more',
        symbol: 'P',
      },
      {
        value: 'computers',
        label: 'Computers & laptops',
        description: 'New & used, for sale',
        symbol: 'C',
      },
      {
        value: 'computer-accessories',
        label: 'Computer accessories',
        description: 'Peripherals & parts',
        symbol: 'C',
      },
      {
        value: 'electronics',
        label: 'Electronics',
        description: 'General electronics for sale',
        symbol: 'E',
      },
      {
        value: 'shoes',
        label: 'Shoes',
        description: 'Footwear for sale',
        symbol: 'S',
      },
      {
        value: 'clothing',
        label: 'Clothing & fabric',
        description: 'Ready-made & fabric',
        symbol: 'C',
      },
      {
        value: 'furniture',
        label: 'Furniture',
        description: 'Home & office furniture',
        symbol: 'F',
      },
      {
        value: 'building-materials',
        label: 'Building materials',
        description: 'For sale by the artisan',
        symbol: 'B',
      },
      {
        value: 'solar-equipment',
        label: 'Solar equipment',
        description: 'Panels, batteries, inverters',
        symbol: 'S',
      },
      {
        value: 'spare-parts',
        label: 'Vehicle spare parts',
        description: 'For sale by the artisan',
        symbol: 'V',
      },
    ],
  },
];

const SERVICE_OPTIONS = SERVICE_GROUPS.flatMap(
  (group) => group.options
);

const DISTANCE_OPTIONS = [2, 5, 10, 25, 50];

const RATING_OPTIONS = [4, 4.5];

/*
  IMPORTANT:
  Only this many artisans are displayed at first.
  This keeps the page short and easier to browse.
*/
const INITIAL_ARTISAN_COUNT = 6;

/* =========================================================
   PAGE
========================================================= */

function SearchPageContent() {
  const params = useSearchParams();

  const [category, setCategory] = useState(
    params.get('category') || ''
  );

  const [radiusKm, setRadiusKm] = useState(10);
  const [minRating, setMinRating] = useState(0);

  const [sort, setSort] =
    useState<SortOption>('recommended');

  const [latitude, setLatitude] = useState('12.0');
  const [longitude, setLongitude] = useState('8.5167');

  const [results, setResults] =
    useState<ArtisanSearchResult[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const [bookingArtisanId, setBookingArtisanId] =
    useState<string | null>(null);

  const [description, setDescription] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const [bookedIds, setBookedIds] = useState<string[]>([]);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationMessage, setLocationMessage] =
    useState('');

  /*
    Controls whether all artisans are displayed.

    false = show only first 6
    true  = show all
  */
  const [showAllArtisans, setShowAllArtisans] =
    useState(false);

  /*
    Mobile filters are collapsed by default.
    This prevents the service page from becoming unnecessarily long.
  */
  const [filtersOpen, setFiltersOpen] =
    useState(false);

  /* =========================================================
     SEARCH
  ========================================================= */

  async function runSearch(
    cat: string,
    radius: number
  ) {
    setLoading(true);
    setError('');
    setShowAllArtisans(false);

    try {
      const data = await searchArtisans({
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
        category: cat || undefined,
        radiusKm: radius,
      });

      setResults(data);
      setSearched(true);
    } catch (err) {
      console.error(err);

      setError(
        'Something went wrong searching for artisans. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     INITIAL SEARCH
  ========================================================= */

  useEffect(() => {
    const urlCategory = params.get('category');

    runSearch(
      urlCategory || '',
      radiusKm
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
     FILTER ACTIONS
  ========================================================= */

  function handleFilterSearch() {
    setFiltersOpen(false);

    runSearch(
      category,
      radiusKm
    );
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
      setLocationMessage(
        'Location is not supported by your browser.'
      );

      return;
    }

    setLocationLoading(true);
    setLocationMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLatitude =
          position.coords.latitude.toString();

        const newLongitude =
          position.coords.longitude.toString();

        setLatitude(newLatitude);
        setLongitude(newLongitude);

        setLocationLoading(false);

        setLocationMessage(
          'Your location is ready.'
        );

        runSearch(
          category,
          radiusKm
        );
      },
      () => {
        setLocationLoading(false);

        setLocationMessage(
          'We could not access your location. You can search using Kano.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  /* =========================================================
     BOOKING
  ========================================================= */

  function openBookingForm(
    artisanId: string
  ) {
    setBookingArtisanId(artisanId);
    setDescription('');
    setBookingError('');
  }

  async function handleBookingSubmit(
    e: React.FormEvent,
    artisanProfileId: string
  ) {
    e.preventDefault();

    if (!description.trim()) {
      setBookingError(
        'Please describe the job.'
      );

      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      await createBooking({
        artisanProfileId,
        description: description.trim(),
      });

      setBookedIds((previous) => [
        ...previous,
        artisanProfileId,
      ]);

      setBookingArtisanId(null);
      setDescription('');
    } catch (err: any) {
      setBookingError(
        err?.message ||
          'Failed to send booking request.'
      );
    } finally {
      setBookingLoading(false);
    }
  }

  /* =========================================================
     FILTER RESULTS
  ========================================================= */

  const filteredResults = useMemo(() => {
    return results
      .filter(
        (artisan) =>
          !minRating ||
          (artisan.ratingAvg &&
            artisan.ratingAvg >= minRating)
      )
      .sort((a, b) => {
        if (sort === 'distance') {
          return (
            a.distanceMeters -
            b.distanceMeters
          );
        }

        if (sort === 'rating') {
          return (
            (b.ratingAvg || 0) -
            (a.ratingAvg || 0)
          );
        }

        return 0;
      });
  }, [
    results,
    minRating,
    sort,
  ]);

  /*
    This is the important part.

    totalResults:
      Number of artisans matching the filters.

    visibleResults:
      What is actually rendered on screen.
  */

  const totalResults =
    filteredResults.length;

  const visibleResults = showAllArtisans
    ? filteredResults
    : filteredResults.slice(
        0,
        INITIAL_ARTISAN_COUNT
      );

  const hasMoreArtisans =
    totalResults >
    INITIAL_ARTISAN_COUNT;

  const selectedService =
    SERVICE_OPTIONS.find(
      (service) =>
        service.value === category
    );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-sand-50 text-teal-900">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-teal-900/10 bg-white">

        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-terracotta-500/10 blur-3xl" />

        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-teal-700/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">

          <div className="max-w-3xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-terracotta-600/20 bg-terracotta-50 px-4 py-2">

              <span className="h-2 w-2 animate-pulse rounded-full bg-terracotta-600" />

              <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-terracotta-600">
                Find an artisan
              </span>

            </div>

            <h1 className="font-display text-4xl leading-tight text-teal-950 sm:text-5xl lg:text-6xl">

              Find skilled hands

              <span className="block text-terracotta-600">
                near you.
              </span>

            </h1>

            <p className="mt-5 max-w-2xl font-body text-base leading-7 text-teal-900/65 sm:text-lg">
              Discover artisans for your next
              job. Choose a service, compare
              nearby professionals, explore
              their work, and send a booking
              request.
            </p>

            {/* LOCATION */}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">

              <button
                type="button"
                onClick={useMyLocation}
                disabled={locationLoading}
                className="group inline-flex items-center justify-center gap-3 rounded-xl border border-teal-900/15 bg-white px-5 py-3.5 font-body text-sm font-semibold text-teal-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-900/30 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-900 text-xs font-bold text-white">
                  {locationLoading
                    ? '...'
                    : '⌖'}
                </span>

                {locationLoading
                  ? 'Finding your location...'
                  : 'Use my current location'}

              </button>

              <span className="font-body text-sm text-teal-900/50">
                Or search around Kano
              </span>

            </div>

            {locationMessage && (
              <p className="mt-3 font-body text-sm text-teal-900/60">
                {locationMessage}
              </p>
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* MOBILE FILTER BUTTON */}

        <button
          type="button"
          onClick={() =>
            setFiltersOpen(
              (previous) => !previous
            )
          }
          className="mb-5 flex w-full items-center justify-between rounded-2xl border border-teal-900/10 bg-white px-5 py-4 shadow-sm lg:hidden"
        >

          <span>
            <span className="block font-display text-lg text-teal-950">
              Search filters
            </span>

            <span className="mt-1 block font-body text-xs text-teal-900/50">
              Service, distance and rating
            </span>
          </span>

          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-900 text-sm font-bold text-white">
            {filtersOpen ? '−' : '+'}
          </span>

        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">

          {/* =================================================
              FILTER SIDEBAR
          ================================================== */}

          <aside
            className={`h-fit rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm ${
              filtersOpen
                ? 'block'
                : 'hidden lg:block'
            } lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto`}
          >

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="font-display text-xl text-teal-950">
                  Refine your search
                </p>

                <p className="mt-1 font-body text-xs text-teal-900/50">
                  Find a better match
                </p>

              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="font-body text-xs font-semibold text-terracotta-600 transition-colors hover:text-terracotta-700"
              >
                Clear
              </button>

            </div>

            {/* SERVICE */}

            <div>

              <div className="mb-3 flex items-center justify-between">

                <p className="font-body text-sm font-bold text-teal-950">
                  Service
                </p>

                {selectedService && (
                  <span className="font-body text-xs text-terracotta-600">
                    {selectedService.label}
                  </span>
                )}

              </div>

              <button
                type="button"
                onClick={() =>
                  setCategory('')
                }
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
                    All services
                  </span>

                  <span className="block font-body text-xs text-teal-900/45">
                    Show every available artisan
                  </span>

                </span>

              </button>

              <div className="space-y-5">

                {SERVICE_GROUPS.map(
                  (group) => (
                    <div
                      key={group.group}
                    >

                      <p className="mb-2 font-body text-xs font-bold uppercase tracking-[0.14em] text-teal-900/35">
                        {group.group}
                      </p>

                      <div className="space-y-2">

                        {group.options.map(
                          (service) => {

                            const active =
                              category ===
                              service.value;

                            return (
                              <button
                                key={
                                  service.value
                                }
                                type="button"
                                onClick={() =>
                                  setCategory(
                                    service.value
                                  )
                                }
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
                                  {
                                    service.symbol
                                  }
                                </span>

                                <span className="min-w-0">

                                  <span className="block font-body text-sm font-semibold text-teal-900">
                                    {
                                      service.label
                                    }
                                  </span>

                                  <span className="block truncate font-body text-xs text-teal-900/45">
                                    {
                                      service.description
                                    }
                                  </span>

                                </span>

                              </button>
                            );
                          }
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* DISTANCE */}

            <div className="mt-7 border-t border-teal-900/10 pt-6">

              <p className="mb-3 font-body text-sm font-bold text-teal-950">
                Distance
              </p>

              <div className="grid grid-cols-2 gap-2">

                {DISTANCE_OPTIONS.map(
                  (distance) => {

                    const active =
                      radiusKm ===
                      distance;

                    return (
                      <button
                        key={distance}
                        type="button"
                        onClick={() =>
                          setRadiusKm(
                            distance
                          )
                        }
                        className={`rounded-lg border px-3 py-2.5 font-body text-xs font-semibold transition-all ${
                          active
                            ? 'border-terracotta-600 bg-terracotta-50 text-terracotta-600'
                            : 'border-teal-900/10 text-teal-900/60 hover:border-teal-900/20 hover:bg-sand-50'
                        }`}
                      >
                        Under {distance} km
                      </button>
                    );
                  }
                )}

              </div>

            </div>

            {/* RATING */}

            <div className="mt-7 border-t border-teal-900/10 pt-6">

              <p className="mb-3 font-body text-sm font-bold text-teal-950">
                Minimum rating
              </p>

              <div className="space-y-2">

                <button
                  type="button"
                  onClick={() =>
                    setMinRating(0)
                  }
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-body text-sm ${
                    minRating === 0
                      ? 'bg-teal-900 text-white'
                      : 'text-teal-900/60 hover:bg-sand-50'
                  }`}
                >

                  <span>
                    Any rating
                  </span>

                  {minRating === 0 && (
                    <span>✓</span>
                  )}

                </button>

                {RATING_OPTIONS.map(
                  (rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        setMinRating(
                          rating
                        )
                      }
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-body text-sm ${
                        minRating ===
                        rating
                          ? 'bg-teal-900 text-white'
                          : 'text-teal-900/60 hover:bg-sand-50'
                      }`}
                    >

                      <span>
                        <span className="text-gold-500">
                          ★
                        </span>{' '}
                        {rating}+
                      </span>

                      {minRating ===
                        rating && (
                        <span>
                          ✓
                        </span>
                      )}

                    </button>
                  )
                )}

              </div>

            </div>

            {/* APPLY */}

            <button
              type="button"
              onClick={handleFilterSearch}
              disabled={loading}
              className="mt-7 w-full rounded-xl bg-terracotta-600 px-5 py-3.5 font-body text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-terracotta-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Searching...'
                : 'Find artisans'}
            </button>

          </aside>

          {/* =================================================
              RESULTS
          ================================================== */}

          <div className="min-w-0">

            {/* RESULTS HEADER */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="font-body text-sm text-teal-900/50">
                  {selectedService
                    ? `Artisans offering ${selectedService.label}`
                    : 'Available artisans near you'}
                </p>

                <div className="mt-1 flex items-baseline gap-2">

                  <span className="font-display text-3xl text-teal-950">
                    {loading
                      ? '—'
                      : totalResults}
                  </span>

                  <span className="font-body text-sm text-teal-900/55">
                    {totalResults === 1
                      ? 'artisan found'
                      : 'artisans found'}
                  </span>

                </div>

                {/* Small explanation when there are many */}

                {!loading &&
                  hasMoreArtisans && (
                    <p className="mt-1 font-body text-xs text-teal-900/45">
                      Showing{' '}
                      {showAllArtisans
                        ? totalResults
                        : Math.min(
                            INITIAL_ARTISAN_COUNT,
                            totalResults
                          )}{' '}
                      of {totalResults}
                    </p>
                  )}

              </div>

              <div className="flex items-center gap-3">

                <label className="font-body text-xs font-semibold uppercase tracking-wider text-teal-900/45">
                  Sort
                </label>

                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(
                      e.target.value as SortOption
                    )
                  }
                  className="rounded-xl border border-teal-900/10 bg-white px-4 py-3 font-body text-sm font-medium text-teal-900 shadow-sm outline-none transition focus:border-terracotta-600"
                >

                  <option value="recommended">
                    Recommended
                  </option>

                  <option value="distance">
                    Nearest
                  </option>

                  <option value="rating">
                    Highest rated
                  </option>

                </select>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

                <p className="font-body text-sm font-semibold text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    handleFilterSearch
                  }
                  className="mt-3 font-body text-sm font-bold text-red-700 underline"
                >
                  Try again
                </button>

              </div>
            )}

            {/* LOADING */}

            {loading && (
              <div className="space-y-4">

                {[1, 2, 3].map(
                  (item) => (
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
                  )
                )}

              </div>
            )}

            {/* EMPTY */}

            {searched &&
              !loading &&
              filteredResults.length ===
                0 &&
              !error && (
                <div className="rounded-3xl border border-dashed border-teal-900/15 bg-white px-6 py-16 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-900 text-lg font-bold text-white">
                    ?
                  </div>

                  <h2 className="mt-5 font-display text-2xl text-teal-950">
                    No artisans found
                  </h2>

                  <p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-teal-900/55">
                    Try expanding your search
                    distance, changing the service,
                    or removing the rating filter.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-xl bg-terracotta-600 px-5 py-3 font-body text-sm font-bold text-white transition hover:bg-terracotta-700"
                  >
                    Reset search
                  </button>

                </div>
              )}

            {/* =================================================
                ARTISAN CARDS
            ================================================== */}

            {!loading &&
              visibleResults.length >
                0 && (
                <div className="space-y-4">

                  {visibleResults.map(
                    (artisan, index) => {
                      
                  const displayName =
                   artisan.fullName ||
                   artisan.tradeCategory ||
                    'Professional artisan';

                      return (
                        <article
                          key={artisan._id}
                          className="group relative overflow-hidden rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-terracotta-600/30 hover:shadow-xl sm:p-6"
                          style={{
                            animation:
                              'fadeUp 0.5s ease both',
                            animationDelay: `${
                              index * 60
                            }ms`,
                          }}
                        >

                          {/* Decorative shape */}

                          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-terracotta-600/5 transition-transform duration-500 group-hover:scale-150" />

                          <div className="relative">

                            {/* TOP */}

                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                              <Link
                                href={`/artisan/${artisan._id}`}
                                className="flex min-w-0 items-start gap-4"
                              >

                                {/* AVATAR */}

                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-teal-900 text-lg font-display font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105">

                                  {artisan.avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={
                                        artisan.avatarUrl
                                      }
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    (
                                      artisan.tradeCategory?.[0] ||
                                      'A'
                                    ).toUpperCase()
                                  )}

                                </div>

                                {/* NAME */}

                                <div className="min-w-0">

                                  <div className="flex flex-wrap items-center gap-2">

                                    <h2 className="font-display text-xl capitalize text-teal-950 transition-colors group-hover:text-terracotta-600">
                                      {displayName}
                                    </h2>

                                    {artisan.verificationStatus ===
                                      'verified' && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-900 px-2.5 py-1 font-body text-[11px] font-bold text-white">
                                        <span>
                                          ✓
                                        </span>
                                        Verified
                                      </span>
                                    )}

                                  </div>

                                  <p className="mt-1 font-body text-sm capitalize text-teal-900/50">
                                    {artisan.tradeCategory ||
                                      'Professional artisan'}
                                  </p>

                                  <p className="mt-2 font-body text-sm font-semibold text-terracotta-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    View profile →
                                  </p>

                                </div>

                              </Link>

                              {/* RATING */}

                              <div className="shrink-0">

                                {artisan.ratingAvg ? (
                                  <div className="inline-flex items-center gap-2 rounded-xl bg-gold-400/10 px-3 py-2">

                                    <span className="text-gold-500">
                                      ★
                                    </span>

                                    <span className="font-body text-sm font-bold text-teal-900">
                                      {artisan.ratingAvg.toFixed(
                                        1
                                      )}
                                    </span>

                                    <span className="font-body text-xs text-teal-900/45">
                                      (
                                      {
                                        artisan.ratingCount
                                      }
                                      )
                                    </span>

                                  </div>
                                ) : (
                                  <span className="font-body text-xs italic text-teal-900/40">
                                    No reviews yet
                                  </span>
                                )}

                              </div>

                            </div>

                            {/* META */}

                            <div className="mt-5 flex flex-wrap gap-2">

                              <span className="rounded-lg bg-sand-50 px-3 py-2 font-body text-xs font-semibold text-teal-900/65">
                                ⌖{' '}
                                {(
                                  artisan.distanceMeters /
                                  1000
                                ).toFixed(1)}{' '}
                                km away
                              </span>

                              <span className="rounded-lg bg-sand-50 px-3 py-2 font-body text-xs font-semibold capitalize text-teal-900/65">
                                {artisan.tradeCategory}
                              </span>

                              {artisan.isAvailable !==
                                false && (
                                <span className="inline-flex items-center gap-2 rounded-lg bg-teal-900/5 px-3 py-2 font-body text-xs font-semibold text-teal-900">

                                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />

                                  Available

                                </span>
                              )}

                            </div>

                            {/* BOOKING */}

                            <div className="mt-5 border-t border-teal-900/10 pt-5">

                              {/* SUCCESS */}

                              {bookedIds.includes(
                                artisan._id
                              ) ? (
                                <div className="flex items-center gap-3 rounded-xl bg-teal-900/5 px-4 py-3">

                                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-900 text-sm text-white">
                                    ✓
                                  </span>

                                  <div>

                                    <p className="font-body text-sm font-bold text-teal-900">
                                      Booking request
                                      sent
                                    </p>

                                    <p className="font-body text-xs text-teal-900/50">
                                      The artisan can now
                                      respond to your
                                      request.
                                    </p>

                                  </div>

                                </div>

                              ) : bookingArtisanId ===
                                artisan._id ? (

                                /* BOOKING FORM */

                                <form
                                  onSubmit={(e) =>
                                    handleBookingSubmit(
                                      e,
                                      artisan._id
                                    )
                                  }
                                  className="rounded-2xl bg-sand-50 p-4"
                                >

                                  <div className="mb-3">

                                    <label className="font-body text-sm font-bold text-teal-950">
                                      What do you need
                                      done?
                                    </label>

                                    <p className="mt-1 font-body text-xs text-teal-900/50">
                                      Give the artisan
                                      enough information
                                      to understand your
                                      job.
                                    </p>

                                  </div>

                                  <textarea
                                    required
                                    rows={4}
                                    value={description}
                                    onChange={(e) =>
                                      setDescription(
                                        e.target.value
                                      )
                                    }
                                    placeholder="Example: I need an electrician to repair a faulty socket in my house..."
                                    className="w-full resize-none rounded-xl border border-teal-900/10 bg-white px-4 py-3 font-body text-sm text-teal-900 outline-none transition focus:border-terracotta-600 focus:ring-2 focus:ring-terracotta-600/10"
                                  />

                                  {bookingError && (
                                    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 font-body text-xs font-semibold text-red-700">
                                      {
                                        bookingError
                                      }
                                    </p>
                                  )}

                                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">

                                    <button
                                      type="submit"
                                      disabled={
                                        bookingLoading
                                      }
                                      className="rounded-xl bg-terracotta-600 px-5 py-3 font-body text-sm font-bold text-white transition-all hover:bg-terracotta-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {bookingLoading
                                        ? 'Sending request...'
                                        : 'Send booking request'}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setBookingArtisanId(
                                          null
                                        )
                                      }
                                      className="rounded-xl border border-teal-900/15 bg-white px-5 py-3 font-body text-sm font-semibold text-teal-900 transition hover:border-teal-900/30"
                                    >
                                      Cancel
                                    </button>

                                  </div>

                                </form>

                              ) : (

                                /* NORMAL ACTIONS */

                                <div className="flex flex-col gap-3 sm:flex-row">

                                  <Link
                                    href={`/artisan/${artisan._id}`}
                                    className="inline-flex items-center justify-center rounded-xl border border-teal-900/15 px-5 py-3 font-body text-sm font-bold text-teal-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-900/30 hover:bg-sand-50"
                                  >
                                    View profile
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openBookingForm(
                                        artisan._id
                                      )
                                    }
                                    className="inline-flex items-center justify-center rounded-xl bg-terracotta-600 px-5 py-3 font-body text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-terracotta-700 hover:shadow-lg"
                                  >
                                    Request booking
                                  </button>

                                </div>

                              )}

                            </div>

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>
              )}

            {/* =================================================
                SHOW MORE / SHOW LESS
            ================================================== */}

            {!loading &&
              hasMoreArtisans && (
                <div className="mt-8 flex flex-col items-center">

                  {!showAllArtisans ? (
                    <>

                      <button
                        type="button"
                        onClick={() =>
                          setShowAllArtisans(
                            true
                          )
                        }
                        className="group inline-flex items-center gap-3 rounded-xl border border-teal-900/15 bg-white px-7 py-3.5 font-body text-sm font-bold text-teal-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-terracotta-600/40 hover:text-terracotta-600 hover:shadow-md"
                      >

                        <span>
                          Show all {totalResults}{' '}
                          artisans
                        </span>

                        <span className="transition-transform duration-300 group-hover:translate-y-0.5">
                          ↓
                        </span>

                      </button>

                      <p className="mt-3 text-center font-body text-xs text-teal-900/45">
                        Showing the first{' '}
                        {Math.min(
                          INITIAL_ARTISAN_COUNT,
                          totalResults
                        )}{' '}
                        artisans to keep browsing
                        simple.
                      </p>

                    </>
                  ) : (

                    <>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAllArtisans(
                            false
                          );

                          window.scrollTo({
                            top: 0,
                            behavior: 'smooth',
                          });
                        }}
                        className="group inline-flex items-center gap-3 rounded-xl border border-teal-900/15 bg-white px-7 py-3.5 font-body text-sm font-bold text-teal-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-terracotta-600/40 hover:text-terracotta-600 hover:shadow-md"
                      >

                        <span>
                          Show fewer artisans
                        </span>

                        <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
                          ↑
                        </span>

                      </button>

                      <p className="mt-3 text-center font-body text-xs text-teal-900/45">
                        Showing all {totalResults}{' '}
                        matching artisans.
                      </p>

                    </>
                  )}

                </div>
              )}

            {/* =================================================
                MAP SECTION
            ================================================== */}

            <div className="relative mt-10 overflow-hidden rounded-3xl border border-teal-900/10 bg-teal-950 p-7 shadow-sm sm:p-10">

              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-terracotta-600/10 blur-3xl" />

              <div className="relative">

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-terracotta-400">
                      Location view
                    </span>

                    <h2 className="mt-2 font-display text-2xl text-white sm:text-3xl">
                      See artisans around you
                    </h2>

                    <p className="mt-2 max-w-xl font-body text-sm leading-6 text-white/55">
                      Map-based discovery is the
                      next layer of the marketplace.
                      Your current search already uses
                      geographic distance to find nearby
                      artisans.
                    </p>

                  </div>

                  <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">

                    <p className="font-body text-xs uppercase tracking-wider text-white/40">
                      Current radius
                    </p>

                    <p className="mt-1 font-display text-2xl text-white">
                      {radiusKm} km
                    </p>

                  </div>

                </div>

                <div className="mt-8 flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03]">

                  <div className="text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                      ⌖
                    </div>

                    <p className="mt-3 font-body text-sm font-semibold text-white/80">
                      Interactive map coming next
                    </p>

                    <p className="mt-1 font-body text-xs text-white/40">
                      We will connect this to your real
                      artisan locations.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          ANIMATION
      ====================================================== */}

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

/* =========================================================
   EXPORT
========================================================= */

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-sand-50" />
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}