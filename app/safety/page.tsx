"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/*
  The text values below are translation KEYS (e.g. "safety.s1.title").
  They are translated where they are shown, with t(...).
*/

const safetySections = [
  {
    id: "before-hiring",
    number: "01",
    title: "safety.s1.title",
    description: "safety.s1.desc",
    items: [
      {
        icon: "👤",
        title: "safety.s1.i1.title",
        text: "safety.s1.i1.text",
      },
      {
        icon: "⭐",
        title: "safety.s1.i2.title",
        text: "safety.s1.i2.text",
      },
      {
        icon: "📸",
        title: "safety.s1.i3.title",
        text: "safety.s1.i3.text",
      },
      {
        icon: "💬",
        title: "safety.s1.i4.title",
        text: "safety.s1.i4.text",
      },
    ],
  },
  {
    id: "during-job",
    number: "02",
    title: "safety.s2.title",
    description: "safety.s2.desc",
    items: [
      {
        icon: "📋",
        title: "safety.s2.i1.title",
        text: "safety.s2.i1.text",
      },
      {
        icon: "💰",
        title: "safety.s2.i2.title",
        text: "safety.s2.i2.text",
      },
      {
        icon: "📱",
        title: "safety.s2.i3.title",
        text: "safety.s2.i3.text",
      },
      {
        icon: "🔐",
        title: "safety.s2.i4.title",
        text: "safety.s2.i4.text",
      },
    ],
  },
  {
    id: "for-artisans",
    number: "03",
    title: "safety.s3.title",
    description: "safety.s3.desc",
    items: [
      {
        icon: "🧰",
        title: "safety.s3.i1.title",
        text: "safety.s3.i1.text",
      },
      {
        icon: "📸",
        title: "safety.s3.i2.title",
        text: "safety.s3.i2.text",
      },
      {
        icon: "🤝",
        title: "safety.s3.i3.title",
        text: "safety.s3.i3.text",
      },
      {
        icon: "🚩",
        title: "safety.s3.i4.title",
        text: "safety.s3.i4.text",
      },
    ],
  },
];

const faqs = [
  { question: "safety.q1", answer: "safety.a1" },
  { question: "safety.q2", answer: "safety.a2" },
  { question: "safety.q3", answer: "safety.a3" },
  { question: "safety.q4", answer: "safety.a4" },
  { question: "safety.q5", answer: "safety.a5" },
  { question: "safety.q6", answer: "safety.a6" },
];

function ShieldIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 3L20 6V11.5C20 16.7 16.7 20.4 12 22C7.3 20.4 4 16.7 4 11.5V6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12L10.8 14.3L15.7 9.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 12H19M13 6L19 12L13 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 12.5L9.5 17L19 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SafetyPage() {
  const { t } = useLanguage();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F3E8] text-[#123D38]">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative overflow-hidden bg-[#083A35] text-white">
        {/* Decorative shapes */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#D5A63A]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-[#C85A3F]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          {/* Breadcrumb */}
          <div className="mb-10 flex items-center gap-2 text-sm text-white/60">
            <Link
              href="/"
              className="transition-colors hover:text-white"
            >
              {t("safety.hero.home")}
            </Link>

            <span>/</span>

            <span className="text-white/90">{t("safety.hero.current")}</span>
          </div>

          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Hero copy */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D5A63A] text-[#083A35]">
                  <ShieldIcon size={15} />
                </span>

                <span>{t("safety.hero.badge")}</span>
              </div>

              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                {t("safety.hero.title1")}
                <span className="block text-[#D5A63A]">
                  {t("safety.hero.title2")}
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
                {t("safety.hero.text")}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/artisans"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#C85A3F] px-6 py-3.5 font-medium text-white shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A94632]"
                >
                  {t("safety.hero.ctaFind")}
                  <ArrowIcon size={18} />
                </Link>

                <button
                  type="button"
                  onClick={() => scrollToSection("before-hiring")}
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-medium text-white transition-all duration-300 hover:bg-white/10"
                >
                  {t("safety.hero.ctaLearn")}
                </button>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto w-full max-w-md lg:ml-auto">
              <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl">
                {/* Top */}
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                      AMANA
                    </p>
                    <p className="mt-1 font-medium text-white">
                      {t("safety.card.trustMatters")}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D5A63A] text-[#083A35]">
                    <ShieldIcon size={27} />
                  </div>
                </div>

                {/* Trust items */}
                <div className="space-y-3 py-5">
                  {[
                    "safety.card.i1",
                    "safety.card.i2",
                    "safety.card.i3",
                    "safety.card.i4",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.045] p-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D5A63A]/15 text-[#D5A63A]">
                        <CheckIcon />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {t(item)}
                        </p>
                      </div>

                      <span className="text-xs text-white/30">
                        0{index + 1}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom */}
                <div className="rounded-2xl bg-[#C85A3F] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/60">
                    {t("safety.card.simple")}
                  </p>

                  <p className="mt-2 text-lg font-medium leading-7">
                    {t("safety.card.principle")}
                  </p>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-[#DCE5E1] bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8F3E8] text-[#0F4C45]">
                    <ShieldIcon size={22} />
                  </div>

                  <div>
                    <p className="text-xs text-[#60736F]">
                      {t("safety.card.badgeLabel")}
                    </p>
                    <p className="font-semibold text-[#123D38]">
                      {t("safety.card.badgeStrong")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TRUST PROMISE
      ========================================================== */}
      <section className="border-b border-[#DCE5E1] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#C85A3F]">
              {t("safety.approach.eyebrow")}
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#083A35] sm:text-4xl">
              {t("safety.approach.title1")}
              <span className="text-[#C85A3F]">
                {" "}
                {t("safety.approach.title2")}
              </span>
            </h2>

            <p className="mt-4 leading-7 text-[#60736F]">
              {t("safety.approach.text")}
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "safety.approach.a1.title",
                text: "safety.approach.a1.text",
                icon: "👤",
              },
              {
                number: "02",
                title: "safety.approach.a2.title",
                text: "safety.approach.a2.text",
                icon: "📋",
              },
              {
                number: "03",
                title: "safety.approach.a3.title",
                text: "safety.approach.a3.text",
                icon: "🤝",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="group rounded-3xl border border-[#DCE5E1] bg-[#F8F3E8]/55 p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    {item.icon}
                  </div>

                  <span className="text-sm font-semibold text-[#C85A3F]">
                    {item.number}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-semibold text-[#083A35]">
                  {t(item.title)}
                </h3>

                <p className="mt-3 leading-7 text-[#60736F]">
                  {t(item.text)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          QUICK NAVIGATION
      ========================================================== */}
      <section className="bg-[#F8F3E8]">
        <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 lg:px-12">
          <div className="rounded-3xl border border-[#DCE5E1] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-semibold text-[#083A35]">
                  {t("safety.nav.looking")}
                </p>

                <p className="mt-1 text-sm text-[#60736F]">
                  {t("safety.nav.jump")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  ["before-hiring", "safety.s1.title"],
                  ["during-job", "safety.s2.title"],
                  ["for-artisans", "safety.s3.title"],
                  ["faqs", "safety.sidebar.faqs"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => scrollToSection(id)}
                    className="rounded-xl border border-[#DCE5E1] bg-[#F8F3E8] px-4 py-2.5 text-sm font-medium text-[#0F4C45] transition-colors hover:border-[#0F4C45]/30 hover:bg-[#0F4C45] hover:text-white"
                  >
                    {t(label)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN SAFETY SECTIONS
      ========================================================== */}
      <section className="bg-[#F8F3E8] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
            {/* Sticky sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#60736F]">
                  {t("safety.sidebar.guide")}
                </p>

                <nav className="mt-5 space-y-1">
                  {safetySections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#60736F] transition-colors hover:bg-white hover:text-[#083A35]"
                    >
                      <span className="text-xs font-semibold text-[#C85A3F]">
                        {section.number}
                      </span>

                      <span>{t(section.title)}</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => scrollToSection("faqs")}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#60736F] transition-colors hover:bg-white hover:text-[#083A35]"
                  >
                    <span className="text-xs font-semibold text-[#C85A3F]">
                      04
                    </span>

                    <span>{t("safety.sidebar.faqs")}</span>
                  </button>
                </nav>

                <div className="mt-8 rounded-2xl bg-[#083A35] p-5 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D5A63A] text-[#083A35]">
                    <ShieldIcon size={21} />
                  </div>

                  <p className="mt-4 text-sm font-medium">
                    {t("safety.sidebar.helpTitle")}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-white/55">
                    {t("safety.sidebar.helpText")}
                  </p>

                  <Link
                    href="/contact"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#D5A63A]"
                  >
                    {t("safety.sidebar.contact")}
                    <ArrowIcon size={15} />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Content */}
            <div className="space-y-20">
              {safetySections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24"
                >
                  {/* Section header */}
                  <div className="flex gap-5">
                    <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0F4C45] font-semibold text-white sm:flex">
                      {section.number}
                    </div>

                    <div>
                      <div className="flex items-center gap-3 sm:hidden">
                        <span className="text-sm font-semibold text-[#C85A3F]">
                          {section.number}
                        </span>
                      </div>

                      <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#083A35] sm:text-4xl">
                        {t(section.title)}
                      </h2>

                      <p className="mt-3 max-w-2xl leading-7 text-[#60736F]">
                        {t(section.description)}
                      </p>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {section.items.map((item) => (
                      <div
                        key={item.title}
                        className="group rounded-3xl border border-[#DCE5E1] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3E8] text-xl">
                            {item.icon}
                          </div>

                          <div className="text-[#C85A3F] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <ArrowIcon size={18} />
                          </div>
                        </div>

                        <h3 className="mt-6 text-lg font-semibold text-[#083A35]">
                          {t(item.title)}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#60736F]">
                          {t(item.text)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          IMPORTANT SECURITY REMINDER
      ========================================================== */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="overflow-hidden rounded-[2rem] bg-[#0F4C45] text-white shadow-2xl">
            <div className="grid lg:grid-cols-[1fr_0.8fr]">
              <div className="p-8 sm:p-12 lg:p-16">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D5A63A] text-[#083A35]">
                  <ShieldIcon size={25} />
                </div>

                <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-[#D5A63A]">
                  {t("safety.reminder.eyebrow")}
                </p>

                <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  {t("safety.reminder.title")}
                </h2>

                <p className="mt-5 max-w-xl leading-7 text-white/65">
                  {t("safety.reminder.text")}
                </p>
              </div>

              <div className="border-t border-white/10 bg-white/[0.04] p-8 sm:p-12 lg:border-l lg:border-t-0 lg:p-16">
                <div className="space-y-4">
                  {[
                    "safety.reminder.r1",
                    "safety.reminder.r2",
                    "safety.reminder.r3",
                    "safety.reminder.r4",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D5A63A]/15 text-[#D5A63A]">
                        <CheckIcon />
                      </span>

                      <span className="text-sm text-white/80">
                        {t(item)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          REPORT PROBLEM
      ========================================================== */}
      <section className="bg-[#F8F3E8] py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#C85A3F] p-8 text-white shadow-2xl sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
                {t("safety.report.eyebrow")}
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {t("safety.report.title1")}
                <span className="block text-[#F8E9B8]">
                  {t("safety.report.title2")}
                </span>
              </h2>

              <p className="mt-5 max-w-2xl leading-7 text-white/75">
                {t("safety.report.text")}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-medium text-[#A94632] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F8F3E8]"
                >
                  {t("safety.report.report")}
                  <ArrowIcon size={18} />
                </Link>

                <Link
                  href="/help"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-medium text-white transition-colors hover:bg-white/10"
                >
                  {t("safety.report.visit")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================== */}
      <section
        id="faqs"
        className="scroll-mt-24 bg-white py-20 sm:py-24"
      >
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#C85A3F]">
              {t("safety.faqSection.eyebrow")}
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#083A35] sm:text-4xl">
              {t("safety.faqSection.title1")}
              <span className="text-[#C85A3F]">
                {" "}
                {t("safety.faqSection.title2")}
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#60736F]">
              {t("safety.faqSection.text")}
            </p>
          </div>

          <div className="mt-10 divide-y divide-[#DCE5E1] rounded-3xl border border-[#DCE5E1] bg-white">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left sm:px-7"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-semibold text-[#083A35] sm:text-lg">
                      {t(faq.question)}
                    </span>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DCE5E1] text-[#0F4C45] transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      <span className="text-xl font-light leading-none">
                        +
                      </span>
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-6 pr-14 text-sm leading-7 text-[#60736F] sm:px-7 sm:pb-7">
                        {t(faq.answer)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}
      <section className="bg-[#F8F3E8] px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F4C45] text-white shadow-lg">
            <ShieldIcon size={27} />
          </div>

          <h2 className="mt-7 text-4xl font-semibold tracking-[-0.04em] text-[#083A35] sm:text-5xl">
            {t("safety.cta.title")}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#60736F]">
            {t("safety.cta.text")}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/artisans"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C85A3F] px-7 py-3.5 font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A94632]"
            >
              {t("safety.cta.find")}
              <ArrowIcon size={18} />
            </Link>

            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-[#0F4C45]/15 bg-white px-7 py-3.5 font-medium text-[#0F4C45] transition-all duration-300 hover:border-[#0F4C45]/30 hover:bg-[#0F4C45] hover:text-white"
            >
              {t("safety.cta.how")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}