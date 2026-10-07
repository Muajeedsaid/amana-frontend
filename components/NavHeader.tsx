'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function NavHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [artisanOpen, setArtisanOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    const token = localStorage.getItem('amana_token');

    setIsLoggedIn(!!token);

    if (!token) {
      setRole(null);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setRole(data?.role ?? null))
      .catch(() => setRole(null));
  }, [pathname]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
    setArtisanOpen(false);
    setHelpOpen(false);
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem('amana_token');
    setIsLoggedIn(false);
    setRole(null);
    window.location.href = '/';
  }

  const isArtisan = role === 'artisan';
  const isAdmin = role === 'admin';
  const canSeeDashboard = isArtisan || isAdmin;

  const navLink =
    'text-sm font-medium text-teal-900 transition-colors hover:text-terracotta-600 whitespace-nowrap';

  const dropdownItem =
    'block w-full rounded-lg px-4 py-2.5 text-left text-sm text-teal-900 transition-colors hover:bg-sand-100 hover:text-terracotta-600';

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-sand-50/95 backdrop-blur-md transition-all duration-300 ${
        scrolled
          ? 'border-terracotta-600/30 shadow-lg'
          : 'border-teal-900/10'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
        {/* LOGO */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3"
          aria-label="Amana home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta-600 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <span className="font-display text-xl font-bold text-white">
              A
            </span>
          </div>

          <div>
            <p
              className="text-2xl font-semibold leading-none text-teal-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Amana
            </p>

            <p className="mt-1 hidden text-[9px] font-medium uppercase tracking-[0.2em] text-terracotta-600 sm:block">
              Trusted hands
            </p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden items-center gap-7 lg:flex">
          {!isArtisan && (
            <Link href="/search" className={navLink}>
              {t('nav.findArtisans')}
            </Link>
          )}

          {/* SERVICES */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setServicesOpen(!servicesOpen);
                setArtisanOpen(false);
                setHelpOpen(false);
              }}
              className={`${navLink} flex items-center gap-1.5`}
            >
              {t('nav.services')}
              <span
                className={`text-xs transition-transform ${
                  servicesOpen ? 'rotate-180' : ''
                }`}
              >
                ↓
              </span>
            </button>

            {servicesOpen && (
              <div className="absolute left-1/2 top-full mt-4 w-64 -translate-x-1/2 rounded-2xl border border-teal-900/10 bg-white p-3 shadow-2xl">
                <p className="px-4 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-terracotta-600">
                  {t('nav.servicesPopular')}
                </p>

                <Link
                  href="/search?category=plumber"
                  className={dropdownItem}
                >
                  🔧 {t('nav.plumbing')}
                </Link>

                <Link
                  href="/search?category=electrician"
                  className={dropdownItem}
                >
                  ⚡ {t('nav.electrical')}
                </Link>

                <Link
                  href="/search?category=solar%20technician"
                  className={dropdownItem}
                >
                  ☀️ {t('nav.solar')}
                </Link>

                <Link
                  href="/search?category=carpenter"
                  className={dropdownItem}
                >
                  🪚 {t('nav.carpentry')}
                </Link>

                <Link
                  href="/search?category=tailor"
                  className={dropdownItem}
                >
                  🧵 {t('nav.tailoring')}
                </Link>

                <Link
                  href="/search?category=mechanic"
                  className={dropdownItem}
                >
                  🚗 {t('nav.autoRepair')}
                </Link>

                <div className="my-2 border-t border-teal-900/10" />

                <Link
                  href="/search"
                  className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-terracotta-600 transition-colors hover:bg-sand-100"
                >
                  {t('nav.viewAllServices')}
                </Link>
              </div>
            )}
          </div>

          {/* HOW IT WORKS */}
          <Link href="/#how-it-works" className={navLink}>
            {t('nav.howItWorks')}
          </Link>

          {/* FOR ARTISANS */}
          {!isArtisan && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setArtisanOpen(!artisanOpen);
                  setServicesOpen(false);
                  setHelpOpen(false);
                }}
                className={`${navLink} flex items-center gap-1.5`}
              >
                {t('nav.forArtisans')}
                <span
                  className={`text-xs transition-transform ${
                    artisanOpen ? 'rotate-180' : ''
                  }`}
                >
                  ↓
                </span>
              </button>

              {artisanOpen && (
                <div className="absolute left-1/2 top-full mt-4 w-64 -translate-x-1/2 rounded-2xl border border-teal-900/10 bg-white p-3 shadow-2xl">
                  <p className="px-4 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-terracotta-600">
                    {t('nav.forArtisansGrow')}
                  </p>

                  <Link
                    href="/register"
                    className={dropdownItem}
                  >
                    {t('nav.becomeArtisan')}
                  </Link>

                  <Link
                    href="/edit-profile"
                    className={dropdownItem}
                  >
                    {t('nav.createProfile')}
                  </Link>

                  <Link
                    href="/edit-profile"
                    className={dropdownItem}
                  >
                    {t('nav.showcaseWork')}
                  </Link>

                  <Link
                    href="/help"
                    className={dropdownItem}
                  >
                    {t('nav.artisanGuide')}
                  </Link>

                  <Link
                    href="/help"
                    className={dropdownItem}
                  >
                    {t('nav.artisanFaqs')}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ARTISAN LINKS */}
          {isArtisan && (
            <Link href="/edit-profile" className={navLink}>
              {t('nav.editProfile')}
            </Link>
          )}

          {/* ADMIN */}
          {isAdmin && (
            <Link href="/admin" className={navLink}>
              {t('nav.admin')}
            </Link>
          )}

          {/* HELP */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setHelpOpen(!helpOpen);
                setServicesOpen(false);
                setArtisanOpen(false);
              }}
              className={`${navLink} flex items-center gap-1.5`}
            >
              {t('nav.help')}
              <span
                className={`text-xs transition-transform ${
                  helpOpen ? 'rotate-180' : ''
                }`}
              >
                ↓
              </span>
            </button>

            {helpOpen && (
              <div className="absolute right-0 top-full mt-4 w-64 rounded-2xl border border-teal-900/10 bg-white p-3 shadow-2xl">
                <p className="px-4 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-terracotta-600">
                  {t('nav.helpHeading')}
                </p>

                <Link
                  href="/help"
                  className={dropdownItem}
                >
                  {t('nav.customerGuide')}
                </Link>

                <Link
                  href="/help"
                  className={dropdownItem}
                >
                  {t('nav.findingArtisan')}
                </Link>

                <Link
                  href="/help"
                  className={dropdownItem}
                >
                  {t('nav.hiringArtisan')}
                </Link>

                <Link
                  href="/help"
                  className={dropdownItem}
                >
                  {t('nav.artisanGuide')}
                </Link>

                <Link
                  href="/safety"
                  className={dropdownItem}
                >
                  {t('nav.safetyTrust')}
                </Link>

                <Link
                  href="/help"
                  className={dropdownItem}
                >
                  {t('nav.contactSupport')}
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* LANGUAGE TOGGLE — always visible, at every screen width */}
        <LanguageToggle />

        {/* RIGHT SIDE */}
        <div className="hidden items-center gap-4 md:flex">
          {isLoggedIn ? (
            <>
             {canSeeDashboard && (
  <Link
    href={isAdmin ? '/admin' : '/dashboard'}
    className={navLink}
  >
    {t('nav.dashboard')}
  </Link>
)}

              <button
                onClick={handleLogout}
                className="rounded-xl border border-terracotta-600 px-4 py-2 text-sm font-semibold text-terracotta-600 transition-all duration-200 hover:bg-terracotta-600 hover:text-white hover:shadow-md"
              >
                {t('nav.logOut')}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={navLink}
              >
                {t('nav.login')}
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-terracotta-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-terracotta-700 hover:shadow-md"
              >
                {t('nav.join')}
              </Link>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-900/10 text-teal-900 transition-colors hover:bg-white lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className="text-xl">
            {mobileOpen ? '✕' : '☰'}
          </span>
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="border-t border-teal-900/10 bg-sand-50 lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-5 py-5">
            {!isArtisan && (
              <Link
                href="/search"
                className="block rounded-xl px-4 py-3 font-medium text-teal-900 hover:bg-white"
              >
                {t('nav.findArtisans')}
              </Link>
            )}

            <div>
              <button
                type="button"
                onClick={() => setServicesOpen(!servicesOpen)}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-medium text-teal-900 hover:bg-white"
              >
                {t('nav.services')}
                <span>{servicesOpen ? '−' : '+'}</span>
              </button>

              {servicesOpen && (
                <div className="ml-4 space-y-1 border-l border-teal-900/10 pl-3">
                  <Link
                    href="/search?category=plumber"
                    className="block rounded-lg px-4 py-2.5 text-sm text-teal-900 hover:bg-white"
                  >
                    🔧 {t('nav.plumbing')}
                  </Link>

                  <Link
                    href="/search?category=electrician"
                    className="block rounded-lg px-4 py-2.5 text-sm text-teal-900 hover:bg-white"
                  >
                    ⚡ {t('nav.electrical')}
                  </Link>

                  <Link
                    href="/search?category=solar%20technician"
                    className="block rounded-lg px-4 py-2.5 text-sm text-teal-900 hover:bg-white"
                  >
                    ☀️ {t('nav.solar')}
                  </Link>

                  <Link
                    href="/search?category=carpenter"
                    className="block rounded-lg px-4 py-2.5 text-sm text-teal-900 hover:bg-white"
                  >
                    🪚 {t('nav.carpentry')}
                  </Link>

                  <Link
                    href="/search?category=tailor"
                    className="block rounded-lg px-4 py-2.5 text-sm text-teal-900 hover:bg-white"
                  >
                    🧵 {t('nav.tailoring')}
                  </Link>

                  <Link
                    href="/search?category=mechanic"
                    className="block rounded-lg px-4 py-2.5 text-sm text-teal-900 hover:bg-white"
                  >
                    🚗 {t('nav.autoRepair')}
                  </Link>

                  <Link
                    href="/search"
                    className="block px-4 py-2.5 text-sm font-semibold text-terracotta-600"
                  >
                    {t('nav.viewAllServices')}
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/#how-it-works"
              className="block rounded-xl px-4 py-3 font-medium text-teal-900 hover:bg-white"
            >
              {t('nav.howItWorks')}
            </Link>

            {!isArtisan && (
              <div>
                <button
                  type="button"
                  onClick={() => setArtisanOpen(!artisanOpen)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-medium text-teal-900 hover:bg-white"
                >
                  {t('nav.forArtisans')}
                  <span>{artisanOpen ? '−' : '+'}</span>
                </button>

                {artisanOpen && (
                  <div className="ml-4 space-y-1 border-l border-teal-900/10 pl-3">
                    <Link
                      href="/register"
                      className="block rounded-lg px-4 py-2.5 text-sm text-teal-900 hover:bg-white"
                    >
                      {t('nav.becomeArtisan')}
                    </Link>

                    <Link
                      href="/edit-profile"
                      className="block rounded-lg px-4 py-2.5 text-sm text-teal-900 hover:bg-white"
                    >
                      {t('nav.createProfile')}
                    </Link>

                    <Link
                      href="/help"
                      className="block rounded-lg px-4 py-2.5 text-sm text-teal-900 hover:bg-white"
                    >
                      {t('nav.artisanGuide')}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {isArtisan && (
              <Link
                href="/dashboard"
                className="block rounded-xl px-4 py-3 font-medium text-teal-900 hover:bg-white"
              >
                {t('nav.editProfile')}
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="block rounded-xl px-4 py-3 font-medium text-teal-900 hover:bg-white"
              >
                {t('nav.admin')}
              </Link>
            )}

            <Link
              href="/help"
              className="block rounded-xl px-4 py-3 font-medium text-teal-900 hover:bg-white"
            >
              {t('nav.help')}
            </Link>

            <div className="my-4 border-t border-teal-900/10" />

            {isLoggedIn ? (
              <>
                {canSeeDashboard && (
                  <Link
                    href="/dashboard"
                    className="block rounded-xl px-4 py-3 font-medium text-teal-900 hover:bg-white"
                  >
                    {t('nav.dashboard')}
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="mt-2 w-full rounded-xl border border-terracotta-600 px-4 py-3 text-left font-semibold text-terracotta-600 hover:bg-terracotta-600 hover:text-white"
                >
                  {t('nav.logOut')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block rounded-xl px-4 py-3 font-medium text-teal-900 hover:bg-white"
                >
                  {t('nav.login')}
                </Link>

                <Link
                  href="/register"
                  className="mt-2 block rounded-xl bg-terracotta-600 px-4 py-3 text-center font-semibold text-white hover:bg-terracotta-700"
                >
                  {t('nav.join')}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}