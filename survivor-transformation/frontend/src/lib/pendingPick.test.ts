import { describe, it, expect, beforeEach } from "vitest";
import { clearPendingPick, readPendingPick, rememberPendingPick } from "./pendingPick";

beforeEach(() => {
  sessionStorage.clear();
});

describe("pendingPick", () => {
  it("round-trips a pick for the same pool and round", () => {
    rememberPendingPick({ poolId: "p1", round: 2, team: "Brazil" });
    expect(readPendingPick("p1", 2)).toEqual({ poolId: "p1", round: 2, team: "Brazil" });
  });

  it("ignores a pick for another pool or round", () => {
    rememberPendingPick({ poolId: "p1", round: 2, team: "Brazil" });
    expect(readPendingPick("p2", 2)).toBeNull();
    expect(readPendingPick("p1", 3)).toBeNull();
  });

  it("returns null for malformed storage and after clearing", () => {
    sessionStorage.setItem("survivor_pending_pick", "{not json");
    expect(readPendingPick("p1", 2)).toBeNull();

    rememberPendingPick({ poolId: "p1", round: 2, team: "Brazil" });
    clearPendingPick();
    expect(readPendingPick("p1", 2)).toBeNull();
  });
});
