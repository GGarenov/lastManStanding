import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import i18n from "~/i18n";
import type { AppLocale } from "~/i18n/constants";
import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from "~/i18n/constants";
import {
  switchLocaleInPathname,
  useAppLocale,
} from "~/i18n/routing";
import { cn } from "~/lib/utils";
import styles from "./LanguageSwitcher.module.less";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation("common");
  const location = useLocation();
  const navigate = useNavigate();
  const currentLocale = useAppLocale();

  const setLocale = (next: AppLocale) => {
    if (next === currentLocale) return;
    void i18n.changeLanguage(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    }
    const path = switchLocaleInPathname(location.pathname, next);
    navigate(`${path}${location.search}${location.hash}`, { replace: true });
  };

  return (
    <div
      className={cn(styles.switcher, className)}
      role="group"
      aria-label={t("languageSwitcher")}
    >
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          className={cn(
            styles.button,
            currentLocale === locale && styles.buttonActive,
          )}
          aria-pressed={currentLocale === locale}
          aria-label={locale === "en" ? t("langEn") : t("langBg")}
          onClick={() => setLocale(locale)}
        >
          {locale === "en" ? t("langEn") : t("langBg")}
        </button>
      ))}
    </div>
  );
}
