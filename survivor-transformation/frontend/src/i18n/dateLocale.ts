import { format, formatDistanceToNow } from "date-fns";
import { bg, enUS } from "date-fns/locale";
import type { FormatOptions, FormatDistanceToNowOptions, Locale } from "date-fns";
import i18n from "~/i18n";
import { isAppLocale } from "~/i18n/constants";

/** date-fns locale aligned with active i18next language (Phase 6.1). */
export function getDateFnsLocale(language?: string): Locale {
  const lng = language ?? i18n.resolvedLanguage ?? i18n.language;
  return isAppLocale(lng) && lng === "bg" ? bg : enUS;
}

export function formatAppDate(
  date: Date | number,
  formatStr: string,
  options?: Omit<FormatOptions, "locale">,
): string {
  return format(date, formatStr, {
    ...options,
    locale: getDateFnsLocale(),
  });
}

export function formatAppDistanceToNow(
  date: Date | number,
  options?: Omit<FormatDistanceToNowOptions, "locale">,
): string {
  return formatDistanceToNow(date, {
    ...options,
    locale: getDateFnsLocale(),
  });
}
