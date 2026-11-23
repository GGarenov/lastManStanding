import { buildLocalizedPath } from "~/i18n/routing";
import type { AppLocale } from "~/i18n/constants";

const AUTH_PAGE = /^\/(?:[a-z]{2}\/)?(?:login|register)\/?$/;

/**
 * Validates a `location.state.from` value before redirecting to it.
 * Only same-app absolute paths are allowed (no `//host`, no `http:`),
 * and never the login/register pages themselves.
 */
export function getSafeFromPath(from: unknown): string | null {
  if (typeof from !== "string") return null;
  if (!from.startsWith("/") || from.startsWith("//") || from.includes("\\")) {
    return null;
  }
  if (AUTH_PAGE.test(from)) return null;
  return from;
}

/**
 * Where to go after a successful login / registration:
 * admins → `/admin`; everyone else → `from` (when safe) or the localized home page.
 */
export function getPostAuthRedirect(
  isAdmin: boolean,
  locale: AppLocale,
  from: unknown,
): string {
  if (isAdmin) return "/admin";
  return getSafeFromPath(from) ?? buildLocalizedPath(locale, "/");
}

/** Reads `from` out of a react-router `location.state`. */
export function getFromState(state: unknown): unknown {
  if (state && typeof state === "object" && "from" in state) {
    return (state as { from?: unknown }).from;
  }
  return undefined;
}
