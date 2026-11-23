/**
 * Remembers the team a guest clicked before being sent to log in,
 * so the pick tab can highlight it (or open the confirm dialog for a member) on return.
 * Per browser tab only (sessionStorage); every access is guarded because storage can be unavailable.
 */
export interface PendingPick {
  poolId: string;
  round: number;
  team: string;
}

const STORAGE_KEY = "survivor_pending_pick";

export function rememberPendingPick(pick: PendingPick): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pick));
  } catch {
    // Storage unavailable (private mode, blocked) — the flow still works without the reminder.
  }
}

/** The remembered pick for this pool + round, or null (wrong pool/round, missing or malformed). */
export function readPendingPick(poolId: string, round: number): PendingPick | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingPick>;
    if (
      parsed?.poolId !== poolId ||
      parsed.round !== round ||
      typeof parsed.team !== "string"
    ) {
      return null;
    }
    return { poolId, round, team: parsed.team };
  } catch {
    return null;
  }
}

export function clearPendingPick(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
