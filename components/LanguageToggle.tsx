'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-full border border-teal-900/15 bg-white p-0.5 text-xs font-semibold">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          language === 'en' ? 'bg-teal-900 text-sand-50' : 'text-teal-900/60 hover:text-teal-900'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ha')}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          language === 'ha' ? 'bg-teal-900 text-sand-50' : 'text-teal-900/60 hover:text-teal-900'
        }`}
      >
        HA
      </button>
    </div>
  );
}