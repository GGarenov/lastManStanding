import { describe, it, expect, vi, beforeEach } from "vitest";

const get = vi.fn();
vi.mock("./client", () => ({ apiClient: { get: (...args: unknown[]) => get(...args) } }));

import {
  getLeaderboard,
  getParticipantRounds,
  getPoolStatusForViewer,
  getPublicPoolSummary,
  getRoundStats,
  isMemberStatus,
} from "./pools.api";

beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue({ data: undefined });
});

describe("isMemberStatus", () => {
  it.each(["approved", "winner"])("%s is a member", (s) => {
    expect(isMemberStatus(s)).toBe(true);
  });
  it.each(["none", "pending", "rejected", undefined, null])("%s is not a member", (s) => {
    expect(isMemberStatus(s)).toBe(false);
  });
});

describe("endpoint selection by access", () => {
  it("rounds: member (default) vs public", async () => {
    await getParticipantRounds("p1");
    expect(get).toHaveBeenLastCalledWith("/pools/p1/survivor/rounds");
    await getParticipantRounds("p1", "public");
    expect(get).toHaveBeenLastCalledWith("/pools/p1/public/rounds");
  });

  it("round stats: member (default) vs public", async () => {
    await getRoundStats("p1", 3);
    expect(get).toHaveBeenLastCalledWith("/pools/p1/survivor/stats/3");
    await getRoundStats("p1", 3, "public");
    expect(get).toHaveBeenLastCalledWith("/pools/p1/public/stats/3");
  });

  it("leaderboard: member (default) vs public", async () => {
    await getLeaderboard("p1");
    expect(get).toHaveBeenLastCalledWith("/pools/p1/survivor/leaderboard");
    await getLeaderboard("p1", "public");
    expect(get).toHaveBeenLastCalledWith("/pools/p1/public/leaderboard");
  });
});

describe("getPublicPoolSummary", () => {
  it("maps the public summary to a MyPoolStatusResponse with status none", async () => {
    get.mockResolvedValue({
      data: {
        id: "p1",
        name: "WC Pool",
        tournamentKey: "world-cup-2026",
        poolStatus: "active",
        playersRemaining: 7,
        totalPlayers: 10,
        prizePoolEur: 400,
        entryFeeEur: 50,
        rakePerEntryEur: 10,
        startedAt: "2026-06-11T19:00:00.000Z",
        finishedAt: null,
      },
    });

    const res = await getPublicPoolSummary("p1");

    expect(get).toHaveBeenCalledWith("/pools/p1/public/summary");
    expect(res).toMatchObject({
      status: "none",
      eliminated: false,
      name: "WC Pool",
      tournamentKey: "world-cup-2026",
      poolStatus: "active",
      playersRemaining: 7,
      totalPlayers: 10,
      prizePoolEur: 400,
    });
  });
});

describe("getPoolStatusForViewer", () => {
  it("uses the per-user endpoint when logged in", async () => {
    get.mockResolvedValue({ data: { status: "pending", name: "Pool" } });
    const res = await getPoolStatusForViewer("p1", true);
    expect(get).toHaveBeenCalledWith("/pools/p1/me");
    expect(res.status).toBe("pending");
  });

  it("uses the public summary for guests", async () => {
    get.mockResolvedValue({ data: { id: "p1", name: "Pool" } });
    const res = await getPoolStatusForViewer("p1", false);
    expect(get).toHaveBeenCalledWith("/pools/p1/public/summary");
    expect(res.status).toBe("none");
  });
});
