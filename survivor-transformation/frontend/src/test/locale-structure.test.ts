import { describe, it, expect } from "vitest";
import {
  bgNamespaces,
  enNamespaces,
  firstSegmentMatchesNamespace,
  flattenLocaleKeyPaths,
  getAllNamespaceNames,
  isCamelCaseKeyPath,
} from "~/locales/localeStructure";

describe("locale naming rules (Phase 2.2)", () => {
  const namespaces = getAllNamespaceNames();

  it("en and bg namespaces expose the same leaf key paths", () => {
    for (const ns of namespaces) {
      const enPaths = flattenLocaleKeyPaths(enNamespaces[ns]);
      const bgPaths = flattenLocaleKeyPaths(bgNamespaces[ns]);
      expect(bgPaths).toEqual(enPaths);
    }
  });

  it("all key path segments use camelCase", () => {
    for (const ns of namespaces) {
      const paths = flattenLocaleKeyPaths(enNamespaces[ns]);
      for (const path of paths) {
        expect(isCamelCaseKeyPath(path), `invalid key path: ${ns}:${path}`).toBe(
          true,
        );
      }
    }
  });

  it("does not repeat namespace as first key segment", () => {
    for (const ns of namespaces) {
      const paths = flattenLocaleKeyPaths(enNamespaces[ns]);
      for (const path of paths) {
        expect(
          firstSegmentMatchesNamespace(ns, path),
          `namespaced key should not start with "${ns}.": ${path}`,
        ).toBe(false);
      }
    }
  });

  it("common.json defines shared actions and errorGeneric", () => {
    const paths = flattenLocaleKeyPaths(enNamespaces.common);
    expect(paths).toContain("actions.save");
    expect(paths).toContain("actions.cancel");
    expect(paths).toContain("actions.loading");
    expect(paths).toContain("errors.errorGeneric");
    expect(paths).toContain("counts.participants_one");
    expect(paths).toContain("counts.participants_other");
  });

  it("home.json defines plural winners forms", () => {
    const paths = flattenLocaleKeyPaths(enNamespaces.home);
    expect(paths).toContain("winners_one");
    expect(paths).toContain("winners_other");
  });
});
