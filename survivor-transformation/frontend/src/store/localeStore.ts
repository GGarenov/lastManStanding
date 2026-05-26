import { create } from "zustand";
import i18n from "~/i18n";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type AppLocale,
  isAppLocale,
} from "~/i18n/constants";

function resolveLocale(language: string | undefined): AppLocale {
  return isAppLocale(language) ? language : DEFAULT_LOCALE;
}

interface LocaleState {
  locale: AppLocale;
  /** Updates i18next + `survivor_locale` in localStorage (Phase 4.1). */
  setLocale: (locale: AppLocale) => Promise<void>;
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: resolveLocale(i18n.resolvedLanguage ?? i18n.language),

  setLocale: async (next) => {
    if (get().locale === next && i18n.language === next) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    }
    await i18n.changeLanguage(next);
    set({ locale: next });
  },
}));

i18n.on("languageChanged", (lng) => {
  useLocaleStore.setState({ locale: resolveLocale(lng) });
});
