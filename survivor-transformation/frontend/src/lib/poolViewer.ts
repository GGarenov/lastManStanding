const STATUS_PRIORITY = ["active", "open", "finished"] as const;

/**
 * Pool a guest / non-member sees by default: active → open → finished.
 * `GET /pools/survivor` returns open + active pools plus at most the latest finished one.
 */
export function getSpectatorPoolId(
  pools: { id: string; status: string }[],
): string | null {
  for (const status of STATUS_PRIORITY) {
    const pool = pools.find((p) => p.status === status);
    if (pool) return pool.id;
  }
  return null;
}

/**
 * Pool shown on the home page.
 * The live game wins: an active pool beats an open one, which beats a finished one.
 * Within the same status, the user's own pool (approved / winner) is preferred.
 * So a member of last year's finished pool still lands on this year's active pool.
 */
export function getHomePoolId(
  pools: { id: string; status: string; myStatus?: string }[],
): string | null {
  const isMine = (myStatus?: string) =>
    myStatus === "approved" || myStatus === "winner";
  for (const status of STATUS_PRIORITY) {
    const candidates = pools.filter((p) => p.status === status);
    const pick = candidates.find((p) => isMine(p.myStatus)) ?? candidates[0];
    if (pick) return pick.id;
  }
  return null;
}
