import type { AppLocale } from '~/i18n/constants';
import { DEFAULT_LOCALE, isAppLocale } from '~/i18n/constants';

/**
 * Reads locale from URL prefix: `/en/...` or `/bg/...`.
 * Paths without prefix (e.g. `/`, `/login`) return undefined — use detector fallback.
 */
export function getLocaleFromPathname(pathname: string): AppLocale | undefined {
  const segment = pathname.split('/').filter(Boolean)[0];
  return isAppLocale(segment) ? segment : undefined;
}

/** Sync i18next language with the current route (call on navigation). */
export function localeFromPathnameOrDefault(pathname: string): AppLocale {
  return getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE;
}
