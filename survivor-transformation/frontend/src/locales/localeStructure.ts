import type { I18nNamespace } from "~/i18n/constants";
import { I18N_NAMESPACES } from "~/i18n/constants";

import enAuth from "~/locales/en/auth.json";
import enCommon from "~/locales/en/common.json";
import enHome from "~/locales/en/home.json";
import enLeaderboard from "~/locales/en/leaderboard.json";
import enNavbar from "~/locales/en/navbar.json";
import enPool from "~/locales/en/pool.json";
import enProfile from "~/locales/en/profile.json";
import enRules from "~/locales/en/rules.json";

import bgAuth from "~/locales/bg/auth.json";
import bgCommon from "~/locales/bg/common.json";
import bgHome from "~/locales/bg/home.json";
import bgLeaderboard from "~/locales/bg/leaderboard.json";
import bgNavbar from "~/locales/bg/navbar.json";
import bgPool from "~/locales/bg/pool.json";
import bgProfile from "~/locales/bg/profile.json";
import bgRules from "~/locales/bg/rules.json";

type JsonObject = Record<string, unknown>;

export const enNamespaces: Record<I18nNamespace, JsonObject> = {
  common: enCommon,
  navbar: enNavbar,
  home: enHome,
  rules: enRules,
  pool: enPool,
  leaderboard: enLeaderboard,
  profile: enProfile,
  auth: enAuth,
};

export const bgNamespaces: Record<I18nNamespace, JsonObject> = {
  common: bgCommon,
  navbar: bgNavbar,
  home: bgHome,
  rules: bgRules,
  pool: bgPool,
  leaderboard: bgLeaderboard,
  profile: bgProfile,
  auth: bgAuth,
};

/** Leaf key paths: `nav.home`, `confirm.pick` */
export function flattenLocaleKeyPaths(
  obj: JsonObject,
  prefix = "",
): string[] {
  const paths: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      paths.push(...flattenLocaleKeyPaths(value as JsonObject, path));
    } else {
      paths.push(path);
    }
  }
  return paths.sort();
}

const PLURAL_SUFFIX = /_(one|other|zero|few|many)$/;

/** Each path segment must be camelCase; plural keys may end with `_one`, `_other`, etc. */
export function isCamelCaseKeyPath(path: string): boolean {
  return path.split(".").every((segment) => {
    const base = segment.replace(PLURAL_SUFFIX, "");
    return /^[a-z][a-zA-Z0-9]*$/.test(base) && base.length > 0;
  });
}

/** Namespace name must not be repeated as the first key segment (use `nav.home`, not `navbar.navbar.home`). */
export function firstSegmentMatchesNamespace(
  namespace: I18nNamespace,
  path: string,
): boolean {
  const first = path.split(".")[0];
  return first === namespace;
}

export function getAllNamespaceNames(): I18nNamespace[] {
  return [...I18N_NAMESPACES];
}
