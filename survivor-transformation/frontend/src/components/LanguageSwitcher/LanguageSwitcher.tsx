import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import type { AppLocale } from "~/i18n/constants";
import { SUPPORTED_LOCALES } from "~/i18n/constants";
import {
  switchLocaleInPathname,
  useAppLocale,
} from "~/i18n/routing";
import { cn } from "~/lib/utils";
import { useLocaleStore } from "~/store/localeStore";
import styles from "./LanguageSwitcher.module.less";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation("common");
  const location = useLocation();
  const navigate = useNavigate();
  const currentLocale = useAppLocale();
  const setLocale = useLocaleStore((s) => s.setLocale);

  const switchLocale = (next: AppLocale) => {
    if (next === currentLocale) return;
    void setLocale(next).then(() => {
      const path = switchLocaleInPathname(location.pathname, next);
      navigate(`${path}${location.search}${location.hash}`, { replace: true });
    });
  };

  return (
    <div
      className={cn(styles.switcher, className)}
      role="group"
      aria-label={t("language.switcher")}
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
          aria-label={locale === "en" ? t("language.en") : t("language.bg")}
          onClick={() => switchLocale(locale)}
        >
          {locale === "en" ? t("language.en") : t("language.bg")}
        </button>
      ))}
    </div>
  );
}
