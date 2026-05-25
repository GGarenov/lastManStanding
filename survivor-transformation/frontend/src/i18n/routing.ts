import { useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  DEFAULT_LOCALE,
  type AppLocale,
  isAppLocale,
} from "~/i18n/constants";
import { getLocaleFromPathname } from "~/i18n/pathLocale";

/** `/en/my-pool` → `/my-pool`; `/login` → `/login` */
export function stripLocalePrefix(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) return pathname;
  const rest = pathname.slice(`/${locale}`.length);
  return rest === "" ? "/" : rest;
}

/** Build path with locale prefix: `buildLocalizedPath('bg', '/rules')` → `/bg/rules` */
export function buildLocalizedPath(locale: AppLocale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function useAppLocale(): AppLocale {
  const { locale } = useParams<{ locale?: string }>();
  if (isAppLocale(locale)) return locale;
  if (typeof window !== "undefined") {
    const fromPath = getLocaleFromPathname(window.location.pathname);
    if (fromPath) return fromPath;
  }
  return DEFAULT_LOCALE;
}

/** Same page under another locale: `/en/rules` ↔ `/bg/rules`. */
export function switchLocaleInPathname(
  pathname: string,
  nextLocale: AppLocale,
): string {
  return buildLocalizedPath(nextLocale, stripLocalePrefix(pathname));
}

/** Prefix user routes with current URL locale (`/en`, `/bg`). Admin paths unchanged. */
export function useLocalizedPath() {
  const appLocale = useAppLocale();
  return useCallback(
    (path: string) => {
      if (path.startsWith("/admin")) return path;
      return buildLocalizedPath(appLocale, path);
    },
    [appLocale],
  );
}
