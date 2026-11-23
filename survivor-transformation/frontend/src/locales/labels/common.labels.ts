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
    countdown: {
      days: t("countdown.days"),
      hours: t("countdown.hours"),
      minutes: t("countdown.minutes"),
      seconds: t("countdown.seconds"),
      closed: t("countdown.closed"),
      closedWithLabel: (label: string) =>
        t("countdown.closedWithLabel", { label }),
      daysShort: t("countdown.daysShort"),
      hoursShort: t("countdown.hoursShort"),
      minutesShort: t("countdown.minutesShort"),
    },
  };
}

export type CommonLabels = ReturnType<typeof buildCommonLabels>;
