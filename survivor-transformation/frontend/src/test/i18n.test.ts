import { describe, it, expect, beforeEach } from "vitest";
import i18n from "~/i18n";
import { LOCALE_STORAGE_KEY } from "~/i18n/constants";
import { formatAppDistanceToNow } from "~/i18n/dateLocale";
import { useLocaleStore } from "~/store/localeStore";

describe("i18n smoke", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    useLocaleStore.setState({ locale: "en" });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCALE_STORAGE_KEY);
    }
  });

  it("resolves English and Bulgarian home copy", async () => {
    await i18n.changeLanguage("en");
    expect(i18n.t("common:app.name")).toBe("Last Man Standing");
    expect(i18n.t("home:smoke.tagline")).toContain("pick one team");
    expect(i18n.t("navbar:nav.home")).toBe("Home");
    expect(i18n.t("pool:confirm.pick", { team: "France" })).toContain("France");
    expect(i18n.t("common:counts.participants", { count: 1 })).toBe(
      "1 participant",
    );
    expect(i18n.t("common:counts.participants", { count: 5 })).toBe(
      "5 participants",
    );
    expect(i18n.t("home:winners", { count: 1 })).toBe("1 winner");
    expect(i18n.t("home:winners", { count: 3 })).toBe("3 winners");

    await i18n.changeLanguage("bg");
    expect(i18n.t("common:app.name")).toBe("Последен останал");
    expect(i18n.t("home:smoke.tagline")).toContain("избери");
    expect(i18n.t("navbar:nav.home")).toBe("Начало");
    expect(i18n.t("common:counts.participants", { count: 1 })).toBe(
      "1 участник",
    );
    expect(i18n.t("common:counts.participants", { count: 5 })).toBe(
      "5 участници",
    );
    expect(i18n.t("home:winners", { count: 2 })).toBe("2 победители");
  });

  it("formatAppDistanceToNow uses Bulgarian locale when lng is bg", async () => {
    await i18n.changeLanguage("bg");
    const aboutOneMinuteAgo = formatAppDistanceToNow(
      new Date(Date.now() - 60_000),
      { addSuffix: true },
    );
    expect(aboutOneMinuteAgo).toMatch(/минута|минути/);
  });

  it("localeStore setLocale persists survivor_locale", async () => {
    await useLocaleStore.getState().setLocale("bg");
    expect(useLocaleStore.getState().locale).toBe("bg");
    expect(i18n.language).toBe("bg");
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("bg");
  });
});
