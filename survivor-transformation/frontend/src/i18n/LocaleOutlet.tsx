import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { DEFAULT_LOCALE, isAppLocale } from "~/i18n/constants";
import { syncI18nWithPathname } from "~/i18n";
import { buildLocalizedPath } from "~/i18n/routing";

/**
 * Validates `:locale` (en|bg), syncs i18n, renders child routes.
 */
export function LocaleOutlet() {
  const { locale } = useParams<{ locale: string }>();
  const location = useLocation();

  useEffect(() => {
    if (isAppLocale(locale)) {
      syncI18nWithPathname(location.pathname);
    }
  }, [locale, location.pathname]);

  if (!isAppLocale(locale)) {
    const segments = location.pathname.split("/").filter(Boolean);
    const rest =
      segments.length > 0 && !isAppLocale(segments[0])
        ? `/${segments.slice(1).join("/")}`
        : "/";
    const target = buildLocalizedPath(DEFAULT_LOCALE, rest);
    return (
      <Navigate
        to={`${target}${location.search}${location.hash}`}
        replace
      />
    );
  }

  return <Outlet />;
}
