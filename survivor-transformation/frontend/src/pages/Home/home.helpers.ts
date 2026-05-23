export type PoolWithMyStatus = {
  myStatus?: string;
};

export function getFeaturedPoolId(
  pools: { id: string; status: string }[],
): string | null {
  const active = pools.find((p) => p.status === "active");
  if (active) return active.id;
  const open = pools.find((p) => p.status === "open");
  return open?.id ?? null;
}

export function getFeaturedPool<T extends { id: string; status: string }>(
  pools: T[],
): T | undefined {
  const active = pools.find((p) => p.status === "active");
  if (active) return active;
  return pools.find((p) => p.status === "open");
}

