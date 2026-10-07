'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { translations, Language } from './translations';

type Vars = Record<string, string | number>;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Translate a key. Supports {placeholders}: t('home.nearby.kmAway', { km: 3 }) */
  t: (path: string, vars?: Vars) => string;
  /** Like t(), but returns `fallback` when the key does not exist (use for API data such as category ids). */
  tOr: (path: string, fallback: string, vars?: Vars) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getNested(obj: any, path: string): string | undefined {
  const value = path
    .split('.')
    .reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj);

  return typeof value === 'string' ? value : undefined;
}

function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem('amana_language') as Language | null;
    if (stored === 'en' || stored === 'ha') {
      setLanguageState(stored);
    }
  }, []);

  // Keep <html lang="..."> in sync for screen readers and browser translation.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    localStorage.setItem('amana_language', lang);
  }

  function resolve(path: string): string | undefined {
    return getNested(translations[language], path) ?? getNested(translations.en, path);
  }

  function t(path: string, vars?: Vars): string {
    const value = resolve(path);
    return value === undefined ? path : interpolate(value, vars);
  }

  function tOr(path: string, fallback: string, vars?: Vars): string {
    const value = resolve(path);
    return value === undefined ? fallback : interpolate(value, vars);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tOr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}