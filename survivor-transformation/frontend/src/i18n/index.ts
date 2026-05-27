import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import {
  DEFAULT_LOCALE,
  DEFAULT_NAMESPACE,
  I18N_NAMESPACES,
  LOCALE_STORAGE_KEY,
  type AppLocale,
  isAppLocale,
} from '~/i18n/constants';
import { getLocaleFromPathname } from '~/i18n/pathLocale';
import { resources } from '~/i18n/resources';

/** URL prefix `/en` | `/bg` — highest priority (Phase 0.3). */
const pathLocaleDetector = {
  name: 'pathLocale',
  lookup(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return getLocaleFromPathname(window.location.pathname);
  },
  cacheUserLanguage(lng: string) {
    if (typeof window === 'undefined' || !isAppLocale(lng)) return;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, lng);
  },
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(pathLocaleDetector);

void i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: ['en', 'bg'],
    ns: [...I18N_NAMESPACES],
    defaultNS: DEFAULT_NAMESPACE,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['pathLocale', 'localStorage', 'navigator'],
      lookupLocalStorage: LOCALE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

/** Apply locale from route (use in locale-aware layout / router). */
export function syncI18nWithPathname(pathname: string): AppLocale {
  const fromPath = getLocaleFromPathname(pathname);
  const next: AppLocale = fromPath ?? (isAppLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE);
  if (i18n.language !== next) {
    void i18n.changeLanguage(next);
  }
  return next;
}

export default i18n;
