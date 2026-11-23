/**
 * Pool a guest / non-member sees by default: active → open → finished.
 * `GET /pools/survivor` returns open + active pools plus at most the latest finished one.
 */
export function getSpectatorPoolId(
  pools: { id: string; status: string }[],
): string | null {
  for (const status of ["active", "open", "finished"]) {
    const pool = pools.find((p) => p.status === status);
    if (pool) return pool.id;
  }
  return null;
}
