import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { searchArtisans, ArtisanSearchResult } from '@/lib/api/search';

/**
 * app/services/[category]/page.tsx
 *
 * SERVER component (no 'use client') — real HTML on every request,
 * which is what search engines actually see. /search stays client-side
 * for the interactive filtering experience; these pages exist purely
 * to be found via Google ("computer repair in Kano" etc.) and hand the
 * visitor off to /search for anything beyond browsing.
 *
 * This list mirrors SERVICE_GROUPS in app/search/page.tsx exactly —
 * same value strings, same categories. If you add a category to the
 * dashboard's catalog, add it here too, or that category will be
 * searchable but won't have its own landing page.
 */

export const revalidate = 3600;

const SERVICES: {
  slug: string;
  category: string;
  label: string;
  description: string;
  symbol: string;
  group: string;
}[] = [
  // Home & building
  { slug: 'plumbing', category: 'plumber', label: 'Plumbers', description: 'Pipes, leaks and water system repairs', symbol: 'P', group: 'Home & building' },
  { slug: 'electrical', category: 'electrician', label: 'Electricians', description: 'Wiring, power faults and installation', symbol: 'E', group: 'Home & building' },
  { slug: 'solar', category: 'solar', label: 'Solar Technicians', description: 'Solar systems, inverters and installation', symbol: 'S', group: 'Home & building' },
  { slug: 'carpentry', category: 'carpenter', label: 'Carpenters', description: 'Furniture, doors and woodwork', symbol: 'C', group: 'Home & building' },
  { slug: 'masonry', category: 'mason', label: 'Masons', description: 'Blockwork, tiling and foundations', symbol: 'M', group: 'Home & building' },
  { slug: 'painting', category: 'painter', label: 'Painters', description: 'Interior and exterior painting', symbol: 'P', group: 'Home & building' },
  { slug: 'welding', category: 'welder', label: 'Welders', description: 'Gates, frames and metalwork', symbol: 'W', group: 'Home & building' },
  { slug: 'ac-repair', category: 'ac-technician', label: 'AC & Refrigeration', description: 'Installation and repair', symbol: 'A', group: 'Home & building' },
  { slug: 'cleaning', category: 'cleaner', label: 'Cleaners', description: 'Home and office cleaning', symbol: 'C', group: 'Home & building' },

  // Technology
  { slug: 'phone-repair', category: 'phone-repair', label: 'Phone Repair', description: 'Screen, battery and software fixes', symbol: 'P', group: 'Technology' },
  { slug: 'computer-repair', category: 'computer-repair', label: 'Computer Repair', description: 'Laptops, desktops and software', symbol: 'C', group: 'Technology' },
  { slug: 'cctv', category: 'cctv', label: 'CCTV & Security', description: 'Installation and maintenance', symbol: 'S', group: 'Technology' },
  { slug: 'generator-repair', category: 'generator-repair', label: 'Generator Repair', description: 'Servicing and fault repair', symbol: 'G', group: 'Technology' },

  // Personal
  { slug: 'tailoring', category: 'tailor', label: 'Tailors', description: 'Clothing and alterations', symbol: 'T', group: 'Personal' },
  { slug: 'barbing', category: 'barber', label: 'Barbers', description: 'Haircuts and grooming', symbol: 'B', group: 'Personal' },

  // Vehicles
  { slug: 'auto-repair', category: 'mechanic', label: 'Mechanics', description: 'Vehicle repairs and servicing', symbol: 'M', group: 'Vehicles' },
  { slug: 'panel-beating', category: 'panel-beater', label: 'Panel Beaters', description: 'Bodywork and dent repair', symbol: 'P', group: 'Vehicles' },

  // Products
  { slug: 'phones-for-sale', category: 'phones', label: 'Phone Dealers', description: 'New and used phones for sale', symbol: 'P', group: 'Products' },
  { slug: 'phone-accessories', category: 'phone-accessories', label: 'Phone Accessories', description: 'Cases, chargers and more', symbol: 'P', group: 'Products' },
  { slug: 'computers-for-sale', category: 'computers', label: 'Computer Dealers', description: 'New and used computers and laptops', symbol: 'C', group: 'Products' },
  { slug: 'computer-accessories', category: 'computer-accessories', label: 'Computer Accessories', description: 'Peripherals and parts', symbol: 'C', group: 'Products' },
  { slug: 'electronics', category: 'electronics', label: 'Electronics Dealers', description: 'General electronics for sale', symbol: 'E', group: 'Products' },
  { slug: 'shoes', category: 'shoes', label: 'Shoe Sellers', description: 'Footwear for sale', symbol: 'S', group: 'Products' },
  { slug: 'clothing', category: 'clothing', label: 'Clothing & Fabric', description: 'Ready-made clothing and fabric', symbol: 'C', group: 'Products' },
  { slug: 'furniture', category: 'furniture', label: 'Furniture Dealers', description: 'Home and office furniture', symbol: 'F', group: 'Products' },
  { slug: 'building-materials', category: 'building-materials', label: 'Building Materials', description: 'Materials for sale', symbol: 'B', group: 'Products' },
  { slug: 'solar-equipment', category: 'solar-equipment', label: 'Solar Equipment', description: 'Panels, batteries and inverters', symbol: 'S', group: 'Products' },
  { slug: 'spare-parts', category: 'spare-parts', label: 'Vehicle Spare Parts', description: 'Parts for sale', symbol: 'V', group: 'Products' },
];

function findService(slug: string) {
  return SERVICES.find((service) => service.slug === slug);
}

export function generateStaticParams() {
  return SERVICES.map((service) => ({ category: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const service = findService(params.category);

  if (!service) {
    return { title: 'Service not found | Amana' };
  }

  const isProduct = service.group === 'Products';
  const title = isProduct
    ? `${service.label} in Kano | Amana`
    : `${service.label} in Kano — Trusted, Verified | Amana`;
  const description = isProduct
    ? `Find trusted ${service.label.toLowerCase()} in Kano on Amana. Browse listings, compare sellers and contact directly.`
    : `Find and hire trusted ${service.label.toLowerCase()} in Kano. Compare profiles, see real work photos and reviews, and book directly on Amana.`;

  return {
    title,
    description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title, description, type: 'website' },
  };
}

const KANO_COORDS = { latitude: 12.0, longitude: 8.5167 };

export default async function ServiceCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const service = findService(params.category);

  if (!service) {
    notFound();
  }

  let results: ArtisanSearchResult[] = [];
  let loadFailed = false;

  try {
    results = await searchArtisans({
      ...KANO_COORDS,
      category: service.category,
      radiusKm: 50,
    });
  } catch {
    loadFailed = true;
  }

  const searchUrl = `/search?category=${encodeURIComponent(service.category)}`;
  const otherInGroup = SERVICES.filter(
    (s) => s.group === service.group && s.slug !== service.slug
  );

  return (
    <main className="min-h-screen bg-sand-50 text-teal-900">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            serviceType: service.label,
            areaServed: { '@type': 'City', name: 'Kano' },
            provider: { '@type': 'Organization', name: 'Amana' },
          }),
        }}
      />

      <section className="relative overflow-hidden border-b border-teal-900/10 bg-white">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-terracotta-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
          <nav className="mb-6 font-body text-xs text-teal-900/45">
            <Link href="/" className="hover:text-teal-900">Amana</Link>
            <span className="mx-2">/</span>
            <Link href="/search" className="hover:text-teal-900">Find Artisans</Link>
            <span className="mx-2">/</span>
            <span className="text-teal-900/70">{service.label}</span>
          </nav>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-terracotta-600/20 bg-terracotta-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-terracotta-600" />
            <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-terracotta-600">
              {service.label} · Kano
            </span>
          </div>

          <h1 className="font-display text-4xl leading-tight text-teal-950 sm:text-5xl">
            {service.label} in Kano
          </h1>

          <p className="mt-5 max-w-2xl font-body text-base leading-7 text-teal-900/65 sm:text-lg">
            {service.description}. Compare profiles, see real work photos,
            and book directly through Amana.
          </p>

          <Link
            href={searchUrl}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-terracotta-600 px-6 py-3.5 font-body text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-terracotta-700"
          >
            Search with filters &amp; your location →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
        {loadFailed ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-body text-sm font-semibold text-red-700">
              We couldn&apos;t load listings right now.
            </p>
            <Link
              href={searchUrl}
              className="mt-3 inline-block font-body text-sm font-bold text-red-700 underline"
            >
              Try the full search page instead
            </Link>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-teal-900/15 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-900 text-lg font-bold text-white">
              {service.symbol}
            </div>

            <h2 className="mt-5 font-display text-2xl text-teal-950">
              No {service.label.toLowerCase()} listed yet
            </h2>

            <p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-teal-900/55">
              New artisans join Amana every week. Check back soon, or
              browse everyone currently available.
            </p>

            <Link
              href="/search"
              className="mt-6 inline-block rounded-xl bg-terracotta-600 px-5 py-3 font-body text-sm font-bold text-white transition hover:bg-terracotta-700"
            >
              Browse all artisans
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 font-body text-sm text-teal-900/55">
              <strong className="text-teal-950">{results.length}</strong>{' '}
              {results.length === 1 ? 'result' : 'results'} found
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((artisan) => {
                const displayName =
                  artisan.businessName || artisan.fullName || artisan.tradeCategory;

                return (
                  <Link
                    key={artisan._id}
                    href={`/artisan/${artisan._id}`}
                    className="group rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-terracotta-600/30 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-teal-900 font-display text-lg font-bold text-white">
                        {artisan.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={artisan.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          (artisan.tradeCategory?.[0] || 'A').toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-lg capitalize text-teal-950 group-hover:text-terracotta-600">
                            {displayName}
                          </h2>

                          {artisan.verificationStatus === 'verified' && (
                            <span className="rounded-full bg-teal-900 px-2 py-0.5 font-body text-[10px] font-bold text-white">
                              ✓ Verified
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-3 font-body text-xs text-teal-900/50">
                          {artisan.ratingAvg ? (
                            <span>
                              <span className="text-gold-500">★</span>{' '}
                              {artisan.ratingAvg.toFixed(1)} ({artisan.ratingCount})
                            </span>
                          ) : (
                            <span>No reviews yet</span>
                          )}

                          {artisan.isAvailable !== false && (
                            <span className="text-teal-700">● Available</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 font-body text-sm font-semibold text-terracotta-600 opacity-0 transition-opacity group-hover:opacity-100">
                      View profile →
                    </p>
                  </Link>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <Link
                href={searchUrl}
                className="inline-flex items-center gap-2 rounded-xl border border-teal-900/15 bg-white px-6 py-3.5 font-body text-sm font-bold text-teal-900 transition hover:border-teal-900/30"
              >
                Filter by distance, rating &amp; more →
              </Link>
            </div>
          </>
        )}

        <div className="mt-14 border-t border-teal-900/10 pt-10">
          <p className="mb-4 font-body text-xs font-bold uppercase tracking-[0.16em] text-teal-900/40">
            More in {service.group}
          </p>

          <div className="flex flex-wrap gap-2">
            {otherInGroup.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="rounded-full border border-teal-900/10 bg-white px-4 py-2 font-body text-sm font-medium text-teal-900 transition hover:border-terracotta-600/40 hover:text-terracotta-600"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}