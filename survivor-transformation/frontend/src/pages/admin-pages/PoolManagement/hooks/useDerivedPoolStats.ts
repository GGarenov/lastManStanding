import { useEffect } from "react";
import type { Pool } from "~/types/pool";

type Participant = {
  status?: string;
  eliminated?: boolean;
};

type Round = {
  isClosed?: boolean;
  roundNumber: number;
};

type UseDerivedPoolStatsArgs = {
  pool: Pool | null;
  participants: Participant[];
  rounds: Round[];
  setPool: (updater: (prev: Pool | null) => Pool | null) => void;
};

export function useDerivedPoolStats({
  pool,
  participants,
  rounds,
  setPool,
}: UseDerivedPoolStatsArgs): void {
  useEffect(() => {
    if (!pool) return;
    const pendingCount = participants.filter(
      (p) => p.status === "pending",
    ).length;
    const approved = participants.filter((p) => p.status === "approved");
    const activePlayers = approved.filter((p) => !p.eliminated).length;
    const eliminatedCount = approved.filter((p) => p.eliminated).length;
    const currentRound =
      rounds.find((r) => !r.isClosed)?.roundNumber ??
      (rounds.length > 0 ? Math.max(...rounds.map((r) => r.roundNumber)) : 0);

    setPool((prev) =>
      prev
        ? {
            ...prev,
            totalParticipants: pendingCount + approved.length,
            activePlayers,
            currentRound,
            pendingCount,
            eliminatedCount,
          }
        : null,
    );
  }, [pool, participants, rounds, setPool]);
}

