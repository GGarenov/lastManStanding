import { describe, it, expect } from "vitest";
import { getHomePoolId, getSpectatorPoolId } from "./poolViewer";

describe("getHomePoolId", () => {
  it("prefers the user's own pool among pools with the same status", () => {
    expect(
      getHomePoolId([
        { id: "a1", status: "active", myStatus: "none" },
        { id: "a2", status: "active", myStatus: "approved" },
      ]),
    ).toBe("a2");
  });

  it("an active pool beats the user's finished pool", () => {
    expect(
      getHomePoolId([
        { id: "old", status: "finished", myStatus: "winner" },
        { id: "live", status: "active", myStatus: "none" },
      ]),
    ).toBe("live");
  });

  it("pending does not count as the user's pool", () => {
    expect(
      getHomePoolId([
        { id: "o1", status: "open", myStatus: "none" },
        { id: "o2", status: "open", myStatus: "pending" },
      ]),
    ).toBe("o1");
  });

  it("falls back to the finished pool, then null", () => {
    expect(getHomePoolId([{ id: "f", status: "finished" }])).toBe("f");
    expect(getHomePoolId([])).toBeNull();
  });
});

describe("getSpectatorPoolId", () => {
  it("prefers the active pool", () => {
    expect(
      getSpectatorPoolId([
        { id: "f", status: "finished" },
        { id: "o", status: "open" },
        { id: "a", status: "active" },
      ]),
    ).toBe("a");
  });

  it("falls back to an open pool", () => {
    expect(
      getSpectatorPoolId([
        { id: "f", status: "finished" },
        { id: "o", status: "open" },
      ]),
    ).toBe("o");
  });

  it("falls back to the finished pool", () => {
    expect(getSpectatorPoolId([{ id: "f", status: "finished" }])).toBe("f");
  });

  it("returns null when there are no pools", () => {
    expect(getSpectatorPoolId([])).toBeNull();
  });
});
