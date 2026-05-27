import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { I18nNamespace } from "~/i18n/constants";

/**
 * Single hook per component/namespace — build a `labels` object from `t` instead of
 * calling `t('key')` on every line (Phase 3).
 */
export function useLabels<N extends I18nNamespace>(namespace: N) {
  const { t, i18n } = useTranslation(namespace);

  return useMemo(
    () => ({
      t,
      i18n,
      locale: i18n.language,
    }),
    [t, i18n],
  );
}
