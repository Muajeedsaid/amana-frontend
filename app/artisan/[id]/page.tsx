'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getArtisanProfile,
  getReviewsForArtisan,
  ArtisanProfileDetail,
  ArtisanReview,
} from '@/lib/api/profiles';
import { createBooking } from '@/lib/api/bookings';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/* =========================================================
   HELPERS
========================================================= */

/**
 * Older accounts registered a free-text trade ("solar technician").
 * Map those onto the catalog ids so they translate too.
 */
const TRADE_ALIASES: Record<string, string> = {
  'solar technician': 'solar',
  'ac technician': 'ac-technician',
  'phone technician': 'phone-repair',
};

function tradeKey(category: unknown): string {
  if (typeof category !== 'string' || !category.trim()) return '';
  const clean = category.trim().toLowerCase();
  return TRADE_ALIASES[clean] || clean.replace(/\s+/g, '-');
}

function titleCase(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const CATEGORY_MARKS: Record<string, string> = {
  plumber: 'PL',
  electrician: 'EL',
  carpenter: 'CA',
  tailor: 'TA',
  mechanic: 'ME',
  solar: 'SO',
  painter: 'PA',
  mason: 'MA',
  'ac-technician': 'AC',
  welder: 'WE',
  cleaner: 'CL',
  'phone-repair': 'PH',
};

function getCategoryMark(category: unknown) {
  return CATEGORY_MARKS[tradeKey(category)] || 'AM';
}

/** Safely converts API values into text. Prevents "Objects are not valid as a React child". */
function safeText(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  return fallback;
}

/** Location from the API may be a string, an object, or GeoJSON. Returns '' when unknown. */
function formatLocation(location: unknown): string {
  if (!location) return '';
  if (typeof location === 'string') return location;

  if (typeof location === 'object') {
    const loc = location as Record<string, unknown>;

    if (typeof loc.address === 'string' && loc.address.trim()) return loc.address;
    if (typeof loc.city === 'string' && loc.city.trim()) return loc.city;
    if (typeof loc.name === 'string' && loc.name.trim()) return loc.name;
  }

  return '';
}

function getSocialUrl(platform: string, value: string) {
  if (!value) return '#';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;

  const clean = value.replace(/^@/, '');

  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${clean}`;
    case 'facebook':
      return `https://facebook.com/${clean}`;
    case 'tiktok':
      return `https://tiktok.com/@${clean}`;
    case 'x':
      return `https://x.com/${clean}`;
    default:
      return value;
  }
}

function initials(value?: string) {
  if (!value) return 'A';

  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function Stars({ value, large = false }: { value: number; large?: boolean }) {
  const { t } = useLanguage();

  return (
    <span
      className={`inline-flex tracking-[0.12em] ${large ? 'text-lg' : 'text-sm'}`}
      aria-label={t('artisan.reviews.starsLabel', { value })}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(value) ? 'text-gold-500' : 'text-teal-900/15'}
        >
          ★
        </span>
      ))}
    </span>
  );
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* =========================================================
   PAGE
========================================================= */

export default function ArtisanProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { t, tOr, language } = useLanguage();

  const id =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : '';

  const [profile, setProfile] = useState<ArtisanProfileDetail | null>(null);
  const [reviews, setReviews] = useState<ArtisanReview[]>([]);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [description, setDescription] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSent, setBookingSent] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    if (!id) return;

    let active = true;

    setLoading(true);
    setNotFound(false);

    Promise.all([
      getArtisanProfile(id),
      getReviewsForArtisan(id).catch(() => [] as ArtisanReview[]),
    ])
      .then(([data, reviewData]) => {
        if (!active) return;
        setProfile(data);
        setReviews(reviewData);
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  /* ---------- derived values ---------- */

  const rawTrade = profile?.tradeCategory;
  const tradeId = tradeKey(rawTrade);

  const categoryName = tradeId
    ? tOr(`catalog.${tradeId}`, titleCase(String(rawTrade)))
    : t('search.card.professional');

  const mark = getCategoryMark(rawTrade);

  const rating = profile && profile.ratingCount > 0 ? profile.ratingAvg : 0;
  const ratingCount = profile?.ratingCount || 0;
  const photos = profile?.portfolioPhotos || [];

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  // Hausa date names come from the browser; it falls back to English if unsupported.
  const dateLocale = language === 'ha' ? 'ha-NG' : 'en-US';

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(dateLocale, {
        month: 'long',
        year: 'numeric',
      })
    : null;

  // profileData is never null, so reading fields can't crash.
  const profileData = (profile ?? {}) as ArtisanProfileDetail & {
    name?: unknown;
    fullName?: unknown;
    businessName?: unknown;
    displayName?: unknown;
    email?: unknown;
    phone?: unknown;
    phoneNumber?: unknown;
    whatsapp?: unknown;
    profilePhoto?: unknown;
    profileImage?: unknown;
    avatar?: unknown;
    avatarUrl?: unknown;
    photo?: unknown;
    location?: unknown;
    address?: unknown;
    city?: unknown;
    area?: unknown;
    state?: unknown;
    serviceArea?: unknown;
    offerType?: unknown;
    serviceIds?: unknown;
    productIds?: unknown;
    customOfferings?: unknown;
    workingDays?: unknown;
    openFrom?: unknown;
    openTo?: unknown;
  };

  const artisanName =
    safeText(profileData.fullName) ||
    safeText(profileData.name) ||
    safeText(profileData.displayName) ||
    categoryName;

  const businessName = safeText(profileData.businessName);
  const artisanEmail = safeText(profileData.email);
  const artisanPhone = safeText(profileData.phone) || safeText(profileData.phoneNumber);
  const artisanWhatsapp = safeText(profileData.whatsapp) || artisanPhone;

  const area = safeText(profileData.area);
  const city = safeText(profileData.city);

  const readableLocation =
    [area, city].filter(Boolean).join(', ') ||
    formatLocation(profileData.location) ||
    safeText(profileData.address) ||
    safeText(profileData.serviceArea) ||
    t('artisan.location.fallback');

  const profilePhoto =
    safeText(profileData.avatarUrl) ||
    safeText(profileData.profilePhoto) ||
    safeText(profileData.profileImage) ||
    safeText(profileData.avatar) ||
    safeText(profileData.photo);

  const offerType = safeText(profileData.offerType, 'services');

  const serviceIds = Array.isArray(profileData.serviceIds)
    ? (profileData.serviceIds as unknown[]).filter((x): x is string => typeof x === 'string')
    : [];

  const productIds = Array.isArray(profileData.productIds)
    ? (profileData.productIds as unknown[]).filter((x): x is string => typeof x === 'string')
    : [];

  // Only approved custom offerings are public.
  const approvedCustomOfferings = Array.isArray(profileData.customOfferings)
    ? (profileData.customOfferings as Array<Record<string, unknown>>).filter(
        (o) => o?.status === 'approved'
      )
    : [];

  const hasStructuredOfferings =
    serviceIds.length > 0 || productIds.length > 0 || approvedCustomOfferings.length > 0;

  const legacySkills = Array.isArray(profile?.skills) ? profile!.skills : [];

  const workingDays = Array.isArray(profileData.workingDays)
    ? (profileData.workingDays as unknown[]).filter((x): x is string => typeof x === 'string')
    : [];

  const openFrom = safeText(profileData.openFrom);
  const openTo = safeText(profileData.openTo);
  const hasHours = workingDays.length > 0 && openFrom && openTo;

  const catalogLabel = (offeringId: string) =>
    tOr(`catalog.${offeringId}`, offeringId.replace(/-/g, ' '));

  const socialLinks = useMemo(
    () =>
      [
        { key: 'instagram', label: 'Instagram', value: profile?.socialMedia?.instagram, mark: 'IG' },
        { key: 'facebook', label: 'Facebook', value: profile?.socialMedia?.facebook, mark: 'f' },
        { key: 'tiktok', label: 'TikTok', value: profile?.socialMedia?.tiktok, mark: 'TK' },
        { key: 'x', label: 'X', value: profile?.socialMedia?.x, mark: 'X' },
      ].filter(
        (item): item is typeof item & { value: string } =>
          typeof item.value === 'string' && item.value.trim().length > 0
      ),
    [profile]
  );

  /* ---------- actions ---------- */

  async function handleBookingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!description.trim()) {
      setBookingError(t('artisan.booking.describeJob'));
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      await createBooking({
        artisanProfileId: id,
        description: description.trim(),
      });

      setBookingSent(true);
      setShowBookingForm(false);
      setDescription('');
    } catch (err: any) {
      // Server messages are English; fall back to a translated generic one.
      setBookingError(err?.message || t('artisan.booking.failed'));
    } finally {
      setBookingLoading(false);
    }
  }

  function openBooking() {
    setBookingSent(false);
    setBookingError('');
    setShowBookingForm(true);
  }

  function handleMessage() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('amana_token') : null;

    if (!token) {
      router.push(`/login?redirect=/artisan/${id}`);
      return;
    }

    router.push('/dashboard?section=messages');
  }

  function handleWhatsApp() {
    if (!artisanWhatsapp) return;

    const digits = artisanWhatsapp.replace(/[^\d]/g, '');
    // Nigerian numbers typed locally start with 0; WhatsApp wants the country code instead.
    const withCountryCode = digits.startsWith('0') ? `234${digits.slice(1)}` : digits;

    const message = encodeURIComponent(
      t('artisan.whatsappMessage', { category: categoryName.toLowerCase() })
    );

    window.open(`https://wa.me/${withCountryCode}?text=${message}`, '_blank');
  }

  /* ---------- states ---------- */

  if (loading) {
    return <LoadingState />;
  }

  if (notFound || !profile) {
    return (
      <main className="min-h-screen bg-sand-50 flex items-center justify-center px-5">
        <div className="w-full max-w-md rounded-3xl border border-teal-900/10 bg-white p-9 text-center shadow-xl shadow-teal-900/5 animate-[fadeUp_.5s_ease-out]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-900 text-white font-display text-xl">
            AM
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-terracotta-600">
            {t('artisan.notFound.eyebrow')}
          </p>

          <h1 className="font-display text-3xl text-teal-900">{t('artisan.notFound.title')}</h1>

          <p className="mt-3 text-sm leading-6 text-teal-900/60">
            {t('artisan.notFound.text')}
          </p>

          <Link
            href="/search"
            className="mt-7 inline-flex rounded-xl bg-terracotta-600 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-terracotta-700"
          >
            {t('artisan.notFound.browse')}
          </Link>
        </div>

        <ProfileStyles />
      </main>
    );
  }

  const bookingCardProps = {
    categoryName,
    rating,
    ratingCount,
    bookingSent,
    description,
    bookingLoading,
    bookingError,
    setDescription,
    onOpen: openBooking,
    onClose: () => {
      setShowBookingForm(false);
      setBookingError('');
    },
    onSubmit: handleBookingSubmit,
    onMessage: handleMessage,
    onWhatsApp: artisanWhatsapp ? handleWhatsApp : undefined,
  };

  return (
    <main className="min-h-screen bg-sand-50 pb-24 lg:pb-0 text-teal-900">
      <ProfileStyles />

      {/* Navigation */}
      <div className="sticky top-0 z-30 border-b border-teal-900/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-8">
          <Link
            href="/search"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-teal-900/60 transition hover:text-teal-900"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            {t('artisan.nav.back')}
          </Link>

          <div className="hidden items-center gap-2 text-xs font-semibold text-teal-900/45 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-900/25" />
            {t('artisan.nav.label')}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-teal-900/10 bg-white">
        <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-terracotta-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-9 md:px-8 md:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
            {/* Profile photo */}
            <div className="profile-enter relative mx-auto lg:mx-0">
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] border border-teal-900/10 bg-sand-50 shadow-lg shadow-teal-900/5 md:h-40 md:w-40">
                {profilePhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePhoto} alt={artisanName} className="h-full w-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(200,90,63,.16),transparent_45%)]" />
                    <span className="relative font-display text-4xl text-teal-900 md:text-5xl">
                      {initials(artisanName)}
                    </span>
                  </>
                )}
              </div>

              {profile.isAvailable && (
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-teal-900 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  {t('artisan.hero.availableNow')}
                </span>
              )}
            </div>

            {/* Identity */}
            <div className="min-w-0 text-center lg:text-left">
              <div className="profile-enter-delay-1 mb-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <span className="rounded-full bg-terracotta-600/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta-600">
                  {categoryName}
                </span>

                {profile.verificationStatus === 'verified' && (
                  <span className="rounded-full border border-teal-900/10 bg-teal-900 px-3 py-1 text-[11px] font-bold text-white">
                    {t('artisan.hero.verified')}
                  </span>
                )}
              </div>

              <h1 className="profile-enter-delay-2 font-display text-4xl leading-[1.05] tracking-tight text-teal-900 sm:text-5xl md:text-6xl">
                {artisanName}
              </h1>

              <p className="profile-enter-delay-2 mt-3 text-base font-semibold text-teal-900/55">
                {businessName || t('artisan.hero.professional', { category: categoryName })}
              </p>

              <div className="profile-enter-delay-3 mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-teal-900/60 lg:justify-start">
                {rating > 0 ? (
                  <span className="inline-flex items-center gap-2">
                    <Stars value={rating} />
                    <strong className="text-teal-900">{rating.toFixed(1)}</strong>
                    <span>
                      ({ratingCount}{' '}
                      {ratingCount === 1 ? t('artisan.hero.review') : t('artisan.hero.reviews')})
                    </span>
                  </span>
                ) : (
                  <span>{t('artisan.hero.noReviews')}</span>
                )}

                <span className="hidden h-1 w-1 rounded-full bg-teal-900/20 sm:block" />

                <span>● {readableLocation}</span>

                {memberSince && (
                  <>
                    <span className="hidden h-1 w-1 rounded-full bg-teal-900/20 sm:block" />
                    <span>{t('artisan.hero.memberSince', { date: memberSince })}</span>
                  </>
                )}
              </div>

              <div className="profile-enter-delay-4 mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <button
                  onClick={openBooking}
                  className="rounded-xl bg-terracotta-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-terracotta-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-terracotta-700"
                >
                  {t('artisan.hero.hire')}
                </button>

                {artisanWhatsapp && (
                  <button
                    onClick={handleWhatsApp}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 px-6 py-3.5 text-sm font-bold text-[#128C4A] transition hover:-translate-y-0.5 hover:bg-[#25D366]/15"
                  >
                    {t('artisan.hero.whatsapp')}
                  </button>
                )}

                <button
                  onClick={handleMessage}
                  className="rounded-xl border border-teal-900/15 bg-white px-6 py-3.5 text-sm font-bold text-teal-900 transition hover:-translate-y-0.5 hover:border-teal-900/30 hover:bg-sand-50"
                >
                  {t('artisan.hero.message')}
                </button>
              </div>
            </div>

            {/* Experience */}
            <div className="profile-enter-delay-2 hidden rounded-2xl border border-teal-900/10 bg-sand-50 p-5 lg:block lg:min-w-[180px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-900/40">
                {t('artisan.hero.experience')}
              </p>

              <p className="mt-2 font-display text-4xl text-teal-900">
                {profile.yearsExperience || '—'}
              </p>

              <p className="mt-1 text-xs text-teal-900/50">{t('artisan.hero.yearsInTrade')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 md:px-8 md:py-12 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-10">
        <div className="min-w-0 space-y-10">
          {/* Trust stats */}
          <section className="profile-section grid grid-cols-2 overflow-hidden rounded-2xl border border-teal-900/10 bg-white shadow-sm sm:grid-cols-4">
            <Stat value={rating > 0 ? rating.toFixed(1) : '—'} label={t('artisan.stats.rating')} />
            <Stat value={String(ratingCount)} label={t('artisan.stats.reviews')} border />
            <Stat
              value={profile.yearsExperience ? String(profile.yearsExperience) : '—'}
              label={t('artisan.stats.years')}
              border
            />
            <Stat
              value={profile.isAvailable ? t('artisan.stats.yes') : '—'}
              label={t('artisan.stats.available')}
              border
            />
          </section>

          {/* Professional details */}
          <Section title={t('artisan.details.title')} eyebrow={t('artisan.details.eyebrow')}>
            <div className="grid gap-3 sm:grid-cols-2">
              {artisanPhone && (
                <InfoCard
                  label={t('artisan.details.phone')}
                  value={artisanPhone}
                  mark="TEL"
                  href={`tel:${artisanPhone.replace(/\s+/g, '')}`}
                />
              )}

              {artisanEmail && (
                <InfoCard label={t('artisan.details.email')} value={artisanEmail} mark="MAIL" />
              )}

              <InfoCard
                label={t('artisan.details.location')}
                value={readableLocation}
                mark="LOC"
              />

              <InfoCard label={t('artisan.details.profession')} value={categoryName} mark={mark} />
            </div>
          </Section>

          {/* About */}
          {typeof profile.bio === 'string' && profile.bio.trim() && (
            <Section title={t('artisan.about.title')} eyebrow={t('artisan.about.eyebrow')}>
              <div className="rounded-2xl border border-teal-900/10 bg-white p-6 shadow-sm md:p-8">
                <p className="whitespace-pre-line text-[15px] leading-8 text-teal-900/70 md:text-base">
                  {profile.bio}
                </p>
              </div>
            </Section>
          )}

          {/* Working hours */}
          {hasHours && (
            <Section title={t('artisan.hours.title')} eyebrow={t('artisan.hours.eyebrow')}>
              <div className="rounded-2xl border border-teal-900/10 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map((day) => {
                    const open = workingDays.includes(day);

                    return (
                      <span
                        key={day}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                          open
                            ? 'bg-teal-900 text-white'
                            : 'bg-sand-50 text-teal-900/30 line-through'
                        }`}
                      >
                        {t(`artisan.days.${day}`)}
                      </span>
                    );
                  })}
                </div>

                <p className="mt-4 text-sm font-semibold text-teal-900">
                  {openFrom} – {openTo}
                </p>
              </div>
            </Section>
          )}

          {/* Services / Products offered */}
          {hasStructuredOfferings ? (
            <Section
              title={
                offerType === 'products'
                  ? t('artisan.offers.titleProducts')
                  : offerType === 'both'
                    ? t('artisan.offers.titleBoth')
                    : t('artisan.offers.titleServices')
              }
              eyebrow={t('artisan.offers.eyebrow')}
            >
              <div className="space-y-6">
                {serviceIds.length > 0 && (
                  <OfferingGroup
                    label={t('artisan.offers.services')}
                    items={serviceIds.map(catalogLabel)}
                    mark={mark}
                  />
                )}

                {productIds.length > 0 && (
                  <OfferingGroup
                    label={t('artisan.offers.products')}
                    items={productIds.map(catalogLabel)}
                    mark="SHOP"
                  />
                )}

                {approvedCustomOfferings.length > 0 && (
                  <OfferingGroup
                    label={t('artisan.offers.also')}
                    items={approvedCustomOfferings.map((o) =>
                      safeText(o.name, t('artisan.offers.custom'))
                    )}
                    mark="+"
                  />
                )}
              </div>
            </Section>
          ) : (
            legacySkills.length > 0 && (
              <Section title={t('artisan.offers.titleServices')} eyebrow={t('artisan.offers.eyebrow')}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {legacySkills.map((skill, index) => {
                    const skillText = safeText(skill, t('artisan.offers.professionalService'));

                    return (
                      <div
                        key={`${skillText}-${index}`}
                        className="group rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-terracotta-600/30 hover:shadow-lg hover:shadow-teal-900/5"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sand-50 text-xs font-black tracking-wider text-teal-900 transition group-hover:bg-teal-900 group-hover:text-white">
                            {mark}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-teal-900">{skillText}</p>
                            <p className="mt-1 text-xs text-teal-900/40">
                              {t('artisan.offers.professionalService')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )
          )}

          {/* Experience banner */}
          {profile.yearsExperience > 0 && (
            <section className="profile-section overflow-hidden rounded-3xl bg-teal-900 p-6 shadow-xl shadow-teal-900/10 md:p-9">
              <div className="relative">
                <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-terracotta-600/20 blur-3xl" />

                <div className="relative flex items-center gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-terracotta-600 text-white shadow-lg">
                    <span className="font-display text-2xl">{profile.yearsExperience}</span>
                  </div>

                  <div>
                    <p className="font-display text-2xl text-white">
                      {t('artisan.experience.title')}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-white/55">
                      {t('artisan.experience.text', { category: categoryName.toLowerCase() })}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Portfolio */}
          <Section
            title={t('artisan.portfolio.title')}
            eyebrow={t('artisan.portfolio.eyebrow')}
            action={
              photos.length > 0
                ? `${photos.length} ${
                    photos.length === 1
                      ? t('artisan.portfolio.project')
                      : t('artisan.portfolio.projects')
                  }`
                : undefined
            }
          >
            {photos.length === 0 ? (
              <EmptyCard
                title={t('artisan.portfolio.emptyTitle')}
                text={t('artisan.portfolio.emptyText')}
                mark="WORK"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((url, index) => {
                  const photoUrl = safeText(url);

                  if (!photoUrl) return null;

                  return (
                    <button
                      key={`${photoUrl}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(photoUrl)}
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-teal-900/10 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-terracotta-600/20"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoUrl}
                        alt={t('artisan.portfolio.sample', { n: index + 1 })}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />

                      <span className="absolute inset-x-3 bottom-3 translate-y-2 rounded-xl bg-teal-900/85 px-3 py-2 text-left text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        {t('artisan.portfolio.viewWork')}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Reviews */}
          <Section
            title={t('artisan.reviews.title')}
            eyebrow={t('artisan.reviews.eyebrow')}
            action={
              rating > 0 ? t('artisan.reviews.outOf', { rating: rating.toFixed(1) }) : undefined
            }
          >
            {reviews.length === 0 ? (
              <EmptyCard
                title={t('artisan.reviews.emptyTitle')}
                text={t('artisan.reviews.emptyText')}
                mark="5.0"
              />
            ) : (
              <div className="space-y-3">
                {visibleReviews.map((review, index) => (
                  <article
                    key={review._id}
                    className="rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-6"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sand-50 text-xs font-bold text-teal-900">
                          AM
                        </div>

                        <div>
                          <p className="text-sm font-bold text-teal-900">
                            {t('artisan.reviews.customer')}
                          </p>
                          <p className="mt-0.5 text-xs text-teal-900/40">
                            {t('artisan.reviews.customerReview')}
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-gold-500/10 px-3 py-1.5 text-xs font-bold text-teal-900">
                        <span className="text-gold-500">★</span> {review.rating}
                      </span>
                    </div>

                    {review.comment && (
                      <p className="mt-5 text-sm leading-7 text-teal-900/70 md:text-base">
                        “{review.comment}”
                      </p>
                    )}

                    <p className="mt-4 text-xs text-teal-900/35">
                      {new Date(review.createdAt).toLocaleDateString(dateLocale, {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </article>
                ))}

                {reviews.length > 3 && (
                  <button
                    onClick={() => setShowAllReviews((value) => !value)}
                    className="w-full rounded-xl border border-teal-900/10 bg-white px-4 py-3 text-sm font-bold text-teal-900 transition hover:border-teal-900/25 hover:bg-sand-50"
                  >
                    {showAllReviews
                      ? t('artisan.reviews.showFewer')
                      : t('artisan.reviews.viewAll', { n: reviews.length })}
                  </button>
                )}
              </div>
            )}
          </Section>

          {/* Social media */}
          {socialLinks.length > 0 && (
            <Section title={t('artisan.social.title')} eyebrow={t('artisan.social.eyebrow')}>
              <div className="grid gap-3 sm:grid-cols-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.key}
                    href={getSocialUrl(social.key, social.value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-terracotta-600/30 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand-50 text-xs font-black text-teal-900 transition group-hover:bg-terracotta-600 group-hover:text-white">
                        {social.mark}
                      </div>

                      <div>
                        <p className="font-semibold text-teal-900">{social.label}</p>
                        <p className="mt-1 max-w-[180px] truncate text-xs text-teal-900/40">
                          {social.value}
                        </p>
                      </div>
                    </div>

                    <span className="text-teal-900/30 transition group-hover:translate-x-1 group-hover:text-terracotta-600">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </Section>
          )}

          {/* Location */}
          <Section title={t('artisan.location.title')} eyebrow={t('artisan.location.eyebrow')}>
            <div className="overflow-hidden rounded-2xl border border-teal-900/10 bg-white shadow-sm">
              <div className="relative flex h-56 items-center justify-center overflow-hidden bg-teal-900 md:h-64">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:24px_24px]" />

                <div className="relative text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/15 bg-terracotta-600 text-xs font-black text-white shadow-2xl animate-pulse">
                    LOC
                  </div>

                  <p className="mt-4 font-display text-2xl text-white">{readableLocation}</p>
                  <p className="mt-1 text-xs text-white/45">{t('artisan.location.approx')}</p>
                </div>
              </div>

              <div className="p-6">
                <p className="font-semibold text-teal-900">{readableLocation}</p>
                <p className="mt-2 text-sm leading-6 text-teal-900/55">
                  {t('artisan.location.text')}
                </p>
              </div>
            </div>
          </Section>

          {/* Safety */}
          <section className="profile-section rounded-2xl border border-terracotta-600/15 bg-terracotta-600/5 p-6 md:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-terracotta-600/10 bg-white text-xs font-black text-terracotta-600">
                SAFE
              </div>

              <div>
                <h2 className="font-display text-xl text-teal-900">{t('artisan.safety.title')}</h2>

                <p className="mt-2 text-sm leading-6 text-teal-900/60">
                  {t('artisan.safety.text')}
                </p>

                <Link
                  href="/safety"
                  className="mt-4 inline-flex text-sm font-bold text-terracotta-600 transition hover:text-terracotta-700"
                >
                  {t('artisan.safety.link')}
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Desktop booking */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <BookingCard showBookingForm={showBookingForm} {...bookingCardProps} />

            <div className="rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-900/35">
                {t('artisan.before.title')}
              </p>

              <div className="mt-4 space-y-4">
                <TrustItem
                  mark="01"
                  title={t('artisan.before.s1Title')}
                  text={t('artisan.before.s1Text')}
                />
                <TrustItem
                  mark="02"
                  title={t('artisan.before.s2Title')}
                  text={t('artisan.before.s2Text')}
                />
                <TrustItem
                  mark="03"
                  title={t('artisan.before.s3Title')}
                  text={t('artisan.before.s3Text')}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-teal-900/10 bg-white/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden">
        {bookingSent ? (
          <div className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-teal-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-900 text-white">
              ✓
            </span>
            {t('artisan.booking.sentShort')}
          </div>
        ) : (
          <div className="mx-auto flex max-w-xl gap-2">
            {artisanWhatsapp ? (
              <button
                onClick={handleWhatsApp}
                className="flex-1 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-3 text-sm font-bold text-[#128C4A]"
              >
                {t('artisan.hero.whatsapp')}
              </button>
            ) : (
              <button
                onClick={handleMessage}
                className="flex-1 rounded-xl border border-teal-900/15 bg-white px-4 py-3 text-sm font-bold text-teal-900"
              >
                {t('artisan.hero.message')}
              </button>
            )}

            <button
              onClick={openBooking}
              className="flex-[1.4] rounded-xl bg-terracotta-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-terracotta-600/20"
            >
              {t('artisan.booking.hireShort')}
            </button>
          </div>
        )}
      </div>

      {/* Mobile booking sheet */}
      {showBookingForm && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-teal-900/60 p-0 backdrop-blur-sm lg:hidden"
          onClick={() => setShowBookingForm(false)}
        >
          <div
            className="w-full max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <BookingCard mobile showBookingForm {...bookingCardProps} />
          </div>
        </div>
      )}

      {/* Image lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-teal-900/90 p-5 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            aria-label={t('artisan.portfolio.closeImage')}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
          >
            ×
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedImage}
            alt={t('artisan.portfolio.lightboxAlt')}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl animate-[zoomIn_.25s_ease-out]"
          />
        </div>
      )}
    </main>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function OfferingGroup({
  label,
  items,
  mark,
}: {
  label: string;
  items: string[];
  mark: string;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-teal-900/40">
        {label}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="group rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-terracotta-600/30 hover:shadow-lg hover:shadow-teal-900/5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sand-50 text-xs font-black tracking-wider text-teal-900 transition group-hover:bg-teal-900 group-hover:text-white">
                {mark}
              </div>

              <div className="min-w-0">
                <p className="font-semibold capitalize text-teal-900">{item}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({
  title,
  eyebrow,
  action,
  children,
}: {
  title: string;
  eyebrow: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="profile-section">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta-600">
            {eyebrow}
          </p>

          <h2 className="mt-1 font-display text-3xl tracking-tight text-teal-900 md:text-4xl">
            {title}
          </h2>
        </div>

        {action && <span className="pb-1 text-xs font-semibold text-teal-900/40">{action}</span>}
      </div>

      {children}
    </section>
  );
}

function Stat({
  value,
  label,
  border = false,
}: {
  value: string;
  label: string;
  border?: boolean;
}) {
  return (
    <div className={`p-5 ${border ? 'border-l border-teal-900/10' : ''}`}>
      <p className="font-display text-2xl text-teal-900">{value}</p>
      <p className="mt-1 text-xs text-teal-900/45">{label}</p>
    </div>
  );
}

function InfoCard({
  label,
  value,
  mark,
  href,
}: {
  label: string;
  value: string;
  mark: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sand-50 text-[10px] font-black text-teal-900">
        {mark}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-900/35">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold text-teal-900">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-terracotta-600/30 hover:shadow-lg"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm">{content}</div>
  );
}

function EmptyCard({ title, text, mark }: { title: string; text: string; mark: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-teal-900/15 bg-white p-9 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sand-50 text-[10px] font-black tracking-wider text-teal-900">
        {mark}
      </div>

      <p className="mt-4 font-semibold text-teal-900">{title}</p>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-teal-900/45">{text}</p>
    </div>
  );
}

function TrustItem({ mark, title, text }: { mark: string; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sand-50 text-[9px] font-black text-teal-900">
        {mark}
      </span>

      <div>
        <p className="text-sm font-bold text-teal-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-teal-900/45">{text}</p>
      </div>
    </div>
  );
}

function BookingCard({
  mobile = false,
  categoryName,
  rating,
  ratingCount,
  showBookingForm,
  bookingSent,
  description,
  bookingLoading,
  bookingError,
  setDescription,
  onOpen,
  onClose,
  onSubmit,
  onMessage,
  onWhatsApp,
}: {
  mobile?: boolean;
  categoryName: string;
  rating: number;
  ratingCount: number;
  showBookingForm: boolean;
  bookingSent: boolean;
  description: string;
  bookingLoading: boolean;
  bookingError: string;
  setDescription: (value: string) => void;
  onOpen: () => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onMessage: () => void;
  onWhatsApp?: () => void;
}) {
  const { t } = useLanguage();
  const fieldId = mobile ? 'job-description-mobile' : 'job-description';

  return (
    <div
      className={`${
        mobile ? 'rounded-t-3xl' : 'rounded-3xl'
      } border border-teal-900/10 bg-white p-6 shadow-2xl shadow-teal-900/10 md:p-7`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta-600">
            {t('artisan.booking.eyebrow')}
          </p>

          <h3 className="mt-2 font-display text-2xl text-teal-900">{categoryName}</h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand-50 text-xs font-black text-teal-900">
          HIRE
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        {rating > 0 ? (
          <>
            <Stars value={rating} />
            <strong className="text-sm text-teal-900">{rating.toFixed(1)}</strong>
            <span className="text-xs text-teal-900/45">({ratingCount})</span>
          </>
        ) : (
          <span className="text-sm text-teal-900/45">{t('artisan.hero.noReviews')}</span>
        )}
      </div>

      {bookingSent ? (
        <div className="mt-6 rounded-2xl border border-teal-900/10 bg-teal-900/5 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-900 text-white">
            ✓
          </div>

          <p className="mt-4 font-bold text-teal-900">{t('artisan.booking.sentTitle')}</p>
          <p className="mt-1 text-sm leading-6 text-teal-900/55">
            {t('artisan.booking.sentText')}
          </p>
        </div>
      ) : showBookingForm ? (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor={fieldId} className="mb-2 block text-sm font-bold text-teal-900">
              {t('artisan.booking.label')}
            </label>

            <textarea
              id={fieldId}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('artisan.booking.placeholder')}
              rows={5}
              className="w-full resize-none rounded-xl border border-teal-900/10 bg-sand-50 px-4 py-3 text-sm text-teal-900 outline-none transition focus:border-terracotta-600 focus:ring-4 focus:ring-terracotta-600/10"
            />
          </div>

          {bookingError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {bookingError}
            </div>
          )}

          <button
            type="submit"
            disabled={bookingLoading}
            className="w-full rounded-xl bg-terracotta-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-terracotta-600/15 transition hover:-translate-y-0.5 hover:bg-terracotta-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bookingLoading ? t('artisan.booking.sending') : t('artisan.booking.send')}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-teal-900/15 px-5 py-3 text-sm font-semibold text-teal-900 transition hover:bg-sand-50"
          >
            {t('artisan.booking.cancel')}
          </button>
        </form>
      ) : (
        <div className="mt-6 space-y-3">
          <button
            onClick={onOpen}
            className="w-full rounded-xl bg-terracotta-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-terracotta-600/20 transition hover:-translate-y-0.5 hover:bg-terracotta-700"
          >
            {t('artisan.booking.hire')}
          </button>

          {onWhatsApp && (
            <button
              onClick={onWhatsApp}
              className="w-full rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 px-6 py-3.5 text-sm font-bold text-[#128C4A] transition hover:-translate-y-0.5 hover:bg-[#25D366]/15"
            >
              {t('artisan.booking.whatsapp')}
            </button>
          )}

          <button
            onClick={onMessage}
            className="w-full rounded-xl border border-teal-900/15 px-6 py-3.5 text-sm font-bold text-teal-900 transition hover:bg-sand-50"
          >
            {t('artisan.booking.amana')}
          </button>

          <p className="pt-1 text-center text-[11px] leading-5 text-teal-900/40">
            {t('artisan.booking.hint')}
          </p>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-sand-50">
      <ProfileStyles />

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="h-4 w-28 animate-pulse rounded-full bg-teal-900/10" />

        <div className="mt-8 rounded-3xl border border-teal-900/10 bg-white p-7 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="h-32 w-32 shrink-0 animate-pulse rounded-[2rem] bg-teal-900/10" />

            <div className="flex-1 space-y-4">
              <div className="h-4 w-28 animate-pulse rounded-full bg-teal-900/10" />
              <div className="h-12 w-2/3 animate-pulse rounded-xl bg-teal-900/10" />
              <div className="h-5 w-1/2 animate-pulse rounded-lg bg-teal-900/10" />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_350px]">
          <div className="space-y-5">
            <div className="h-28 animate-pulse rounded-2xl bg-white" />
            <div className="h-52 animate-pulse rounded-2xl bg-white" />
            <div className="h-64 animate-pulse rounded-2xl bg-white" />
          </div>

          <div className="hidden h-80 animate-pulse rounded-3xl bg-white lg:block" />
        </div>
      </div>
    </main>
  );
}

function ProfileStyles() {
  return (
    <style jsx global>{`
      @keyframes fadeUp {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes zoomIn {
        from {
          opacity: 0;
          transform: scale(0.96);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .profile-enter {
        animation: fadeUp 0.55s ease-out both;
      }
      .profile-enter-delay-1 {
        animation: fadeUp 0.55s 0.08s ease-out both;
      }
      .profile-enter-delay-2 {
        animation: fadeUp 0.55s 0.14s ease-out both;
      }
      .profile-enter-delay-3 {
        animation: fadeUp 0.55s 0.2s ease-out both;
      }
      .profile-enter-delay-4 {
        animation: fadeUp 0.55s 0.26s ease-out both;
      }
      .profile-section {
        animation: fadeUp 0.6s ease-out both;
      }

      @media (prefers-reduced-motion: reduce) {
        .profile-enter,
        .profile-enter-delay-1,
        .profile-enter-delay-2,
        .profile-enter-delay-3,
        .profile-enter-delay-4,
        .profile-section {
          animation: none !important;
        }

        .animate-pulse {
          animation: none !important;
        }
      }
    `}</style>
  );
}