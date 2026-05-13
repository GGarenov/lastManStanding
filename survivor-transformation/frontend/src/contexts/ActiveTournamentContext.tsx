import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useOpenPoolsStore } from '~/store/openPoolsStore';
import { getTournamentConfig } from '~/config/tournaments';

export interface ActiveTournament {
  key: string;
  label: string;
}

export interface ActiveTournamentContextValue {
  /** Current active tournament from featured pool (first active, else first open); null if no pool or no tournamentKey. */
  activeTournament: ActiveTournament | null;
  /** True while open pools are being fetched. */
  isLoading: boolean;
}

const ActiveTournamentContext = createContext<ActiveTournamentContextValue | null>(null);

/** Featured pool: first active, else first open (by status). */
function getFeaturedPool<T extends { status: string; tournamentKey?: string }>(pools: T[]): T | undefined {
  const active = pools.find((p) => p.status === 'active');
  if (active) return active;
  return pools.find((p) => p.status === 'open');
}

export function useActiveTournament(): ActiveTournamentContextValue {
  const ctx = useContext(ActiveTournamentContext);
  if (!ctx) {
    throw new Error('useActiveTournament must be used within ActiveTournamentProvider');
  }
  return ctx;
}

interface ActiveTournamentProviderProps {
  children: ReactNode;
}

export function ActiveTournamentProvider({ children }: ActiveTournamentProviderProps) {
  const { pools, isLoading, fetchPools } = useOpenPoolsStore();

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  const value = useMemo((): ActiveTournamentContextValue => {
    const featured = getFeaturedPool(pools);
    if (!featured?.tournamentKey) {
      return { activeTournament: null, isLoading };
    }
    const config = getTournamentConfig(featured.tournamentKey);
    if (!config) {
      return { activeTournament: null, isLoading };
    }
    return {
      activeTournament: { key: config.key, label: config.label },
      isLoading,
    };
  }, [pools, isLoading]);

  return (
    <ActiveTournamentContext.Provider value={value}>
      {children}
    </ActiveTournamentContext.Provider>
  );
}
