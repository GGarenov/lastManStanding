import { describe, it, expect } from "vitest";
import {
  toPoolShape,
  toParticipantStatus,
  toParticipantShape,
  toRoundShape,
} from "./mappers";
import type { NormalizedBackendPool, NormalizedBackendParticipant, NormalizedBackendRound } from "./mappers";

describe("toPoolShape", () => {
  it("maps backend pool to frontend Pool with placeholder counts", () => {
    const b: NormalizedBackendPool = {
      id: "pool-1",
      name: "Test Pool",
      description: "Desc",
      status: "open",
      createdBy: "user-1",
      startedAt: undefined,
      finishedAt: undefined,
      tournamentKey: "euro-2024",
      createdAt: "2024-01-01T00:00:00Z",
    };
    const result = toPoolShape(b);
    expect(result.id).toBe("pool-1");
    expect(result.name).toBe("Test Pool");
    expect(result.description).toBe("Desc");
    expect(result.status).toBe("open");
    expect(result.currentRound).toBe(0);
    expect(result.totalParticipants).toBe(0);
    expect(result.activePlayers).toBe(0);
    expect(result.tournamentKey).toBe("euro-2024");
    expect(result.createdAt).toBe("2024-01-01T00:00:00Z");
  });

  it("maps status 'finished' to 'completed'", () => {
    const b: NormalizedBackendPool = {
      id: "p",
      name: "P",
      status: "finished",
      createdBy: "u",
    } as NormalizedBackendPool;
    expect(toPoolShape(b).status).toBe("completed");
  });
});

describe("toParticipantStatus", () => {
  it("returns 'eliminated' for rejected", () => {
    const b = { id: "x", status: "rejected" } as NormalizedBackendParticipant;
    expect(toParticipantStatus(b)).toBe("eliminated");
  });

  it("returns 'eliminated' when eliminated flag is true", () => {
    const b = {
      id: "x",
      status: "approved",
      eliminated: true,
    } as NormalizedBackendParticipant;
    expect(toParticipantStatus(b)).toBe("eliminated");
  });

  it("returns status as-is for pending/approved/winner", () => {
    expect(
      toParticipantStatus({ id: "x", status: "pending" } as NormalizedBackendParticipant)
    ).toBe("pending");
    expect(
      toParticipantStatus({ id: "x", status: "approved" } as NormalizedBackendParticipant)
    ).toBe("approved");
    expect(
      toParticipantStatus({ id: "x", status: "winner" } as NormalizedBackendParticipant)
    ).toBe("winner");
  });
});

describe("toParticipantShape", () => {
  it("uses username from userMap for name", () => {
    const b: NormalizedBackendParticipant = {
      id: "part-1",
      userId: "u1",
      poolId: "p1",
      status: "approved",
      joinedAt: "2024-01-01",
    } as NormalizedBackendParticipant;
    const userMap = { u1: { email: "u1@x.com", username: "cooluser" } };
    const result = toParticipantShape(b, userMap);
    expect(result.name).toBe("cooluser");
    expect(result.email).toBe("u1@x.com");
    expect(result.status).toBe("approved");
    expect(result.joinedAt).toBe("2024-01-01");
    expect(result.picks).toEqual([]);
  });

  it("falls back to email prefix when username missing in userMap", () => {
    const b = {
      id: "part-1",
      userId: "u1",
      poolId: "p1",
      status: "approved",
      joinedAt: "",
    } as NormalizedBackendParticipant;
    const userMap = { u1: { email: "alice@example.com" } };
    const result = toParticipantShape(b, userMap);
    expect(result.name).toBe("alice");
  });

  it("uses userId as email when user not in userMap", () => {
    const b = {
      id: "part-1",
      userId: "unknown-id",
      poolId: "p1",
      status: "pending",
      joinedAt: "",
    } as NormalizedBackendParticipant;
    const result = toParticipantShape(b, {});
    expect(result.email).toBe("unknown-id");
    // name falls back to email (userId) when no @, so "unknown-id"
    expect(result.name).toBe("unknown-id");
  });
});

describe("toRoundShape", () => {
  it("maps round with matches and result", () => {
    const b: NormalizedBackendRound = {
      id: "round-1",
      poolId: "p1",
      roundNumber: 1,
      isClosed: false,
      matches: [
        {
          homeTeam: "Germany",
          awayTeam: "France",
          winnerTeam: "Germany",
          isDraw: false,
          homeGoals: 2,
          awayGoals: 1,
        },
      ],
      pickDeadline: "2024-06-01T12:00:00Z",
    } as NormalizedBackendRound;
    const result = toRoundShape(b);
    expect(result.id).toBe("round-1");
    expect(result.number).toBe(1);
    expect(result.status).toBe("active");
    expect(result.deadline).toBe("2024-06-01T12:00:00Z");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].id).toBe("Germany-France");
    expect(result.matches[0].teamA).toBe("Germany");
    expect(result.matches[0].teamB).toBe("France");
    expect(result.matches[0].result).toBe("team_a");
    expect(result.matches[0].homeGoals).toBe(2);
    expect(result.matches[0].awayGoals).toBe(1);
  });

  it("maps draw and closed round", () => {
    const b: NormalizedBackendRound = {
      id: "r2",
      poolId: "p1",
      roundNumber: 2,
      isClosed: true,
      matches: [
        { homeTeam: "A", awayTeam: "B", isDraw: true },
      ],
    } as NormalizedBackendRound;
    const result = toRoundShape(b);
    expect(result.status).toBe("closed");
    expect(result.matches[0].result).toBe("draw");
  });
});
