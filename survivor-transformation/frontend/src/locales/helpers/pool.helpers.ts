import type { TFunction } from "i18next";

/** Confirm team pick — `team` is API/config name (not translated). */
export function getConfirmPickMessage(
  t: TFunction<"pool">,
  team: string,
): string {
  return t("confirm.pick", { team });
}

export function buildPoolConfirmLabels(t: TFunction<"pool">) {
  return {
    pickTitle: t("confirm.pickTitle"),
    pickMessage: (team: string) => getConfirmPickMessage(t, team),
    cancel: t("confirm.defaultCancel"),
    confirm: t("confirm.pickButton"),
    confirming: t("confirm.confirming"),
  };
}
