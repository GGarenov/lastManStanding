/** Supported UI locales (Phase 0). Admin UI is not localized. */
export const SUPPORTED_LOCALES = ['en', 'bg'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';

export const LOCALE_STORAGE_KEY = 'survivor_locale';

/** i18next namespaces — no `admin` (Phase 0.1). */
export const I18N_NAMESPACES = [
  'common',
  'navbar',
  'home',
  'rules',
  'pool',
  'leaderboard',
  'profile',
  'auth',
  'tournamentLobby',
] as const;

export type I18nNamespace = (typeof I18N_NAMESPACES)[number];

export const DEFAULT_NAMESPACE: I18nNamespace = 'common';

export function isAppLocale(value: string | undefined): value is AppLocale {
  return value === 'en' || value === 'bg';
}
