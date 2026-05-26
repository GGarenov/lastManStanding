import type { TFunction } from "i18next";

export function buildCommonLabels(t: TFunction<"common">) {
  return {
    guest: {
      displayName: t("guest.displayName"),
    },
    notFound: {
      code: t("notFound.code"),
      message: t("notFound.message"),
      backHome: t("notFound.backHome"),
    },
    a11y: {
      close: t("a11y.close"),
      pagination: t("a11y.pagination"),
      errorIcon: t("a11y.errorIcon"),
    },
  };
}

export type CommonLabels = ReturnType<typeof buildCommonLabels>;
