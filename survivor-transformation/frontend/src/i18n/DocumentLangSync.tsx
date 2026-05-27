import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE, isAppLocale } from "~/i18n/constants";

function resolveHtmlLang(language: string | undefined): string {
  return isAppLocale(language) ? language : DEFAULT_LOCALE;
}

/** Keeps `<html lang="en|bg">` in sync with i18next (accessibility + SEO). */
export function DocumentLangSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const apply = (lng: string) => {
      document.documentElement.lang = resolveHtmlLang(lng);
    };

    apply(i18n.resolvedLanguage ?? i18n.language);
    i18n.on("languageChanged", apply);
    return () => {
      i18n.off("languageChanged", apply);
    };
  }, [i18n]);

  return null;
}
