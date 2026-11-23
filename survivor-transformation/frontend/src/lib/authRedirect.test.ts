import { describe, it, expect } from "vitest";
import {
  getFromState,
  getPostAuthRedirect,
  getSafeFromPath,
} from "./authRedirect";

describe("getSafeFromPath", () => {
  it.each(["/en", "/bg/stats/abc", "/en/my-pool"])("accepts %s", (p) => {
    expect(getSafeFromPath(p)).toBe(p);
  });

  it.each([
    "//evil.com",
    "https://evil.com",
    "/\\evil.com",
    "en/my-pool",
    "/en/login",
    "/bg/register",
    "/login",
    "",
    undefined,
    42,
  ])("rejects %s", (p) => {
    expect(getSafeFromPath(p)).toBeNull();
  });
});

describe("getPostAuthRedirect", () => {
  it("sends admins to /admin regardless of from", () => {
    expect(getPostAuthRedirect(true, "en", "/en/my-pool")).toBe("/admin");
  });

  it("returns to a safe from path", () => {
    expect(getPostAuthRedirect(false, "bg", "/bg/stats")).toBe("/bg/stats");
  });

  it("falls back to the localized home page", () => {
    expect(getPostAuthRedirect(false, "bg", undefined)).toBe("/bg");
    expect(getPostAuthRedirect(false, "en", "//evil.com")).toBe("/en");
  });
});

describe("getFromState", () => {
  it("reads from out of router state", () => {
    expect(getFromState({ from: "/en" })).toBe("/en");
    expect(getFromState(null)).toBeUndefined();
    expect(getFromState("x")).toBeUndefined();
  });
});
