import { Navigate, useLocation } from "react-router-dom";
import { DEFAULT_LOCALE } from "~/i18n/constants";
import { buildLocalizedPath, stripLocalePrefix } from "~/i18n/routing";

/** Redirects old paths without locale (`/login`) → `/en/login`. */
export function LegacyLocaleRedirect() {
  const location = useLocation();
  const path = stripLocalePrefix(location.pathname);
  const target = buildLocalizedPath(DEFAULT_LOCALE, path);
  return (
    <Navigate to={`${target}${location.search}${location.hash}`} replace />
  );
}
