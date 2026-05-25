import { describe, it, expect, beforeEach } from "vitest";
import i18n from "~/i18n";

describe("i18n smoke", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("resolves English and Bulgarian home copy", async () => {
    await i18n.changeLanguage("en");
    expect(i18n.t("common:appName")).toBe("Last Man Standing");
    expect(i18n.t("home:tagline")).toContain("pick one team");

    await i18n.changeLanguage("bg");
    expect(i18n.t("common:appName")).toBe("Последен останал");
    expect(i18n.t("home:tagline")).toContain("избери");
  });
});
