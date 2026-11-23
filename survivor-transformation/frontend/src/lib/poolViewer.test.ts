import { describe, it, expect } from "vitest";
import { getSpectatorPoolId } from "./poolViewer";

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
