import { createContext, useContext, type ReactNode } from 'react';
import type { TournamentConfig } from '~/config/tournaments/types';
import type { MyPoolStatusResponse } from '~/api/pools.api';
import type { ParticipantRound } from '~/api/pools.api';

export interface PoolPageContextValue {
  poolId: string;
  poolInfo: MyPoolStatusResponse | null;
  tournamentConfig: TournamentConfig | null;
  rounds: ParticipantRound[];
  isLoading: boolean;
  error: string | null;
  /** True when user is not approved (pending, rejected, none) — show "Join a pool" */
  isNotApproved: boolean;
  /**
   * Refetch pool status and rounds without clearing the UI (for tab focus / switching to data tabs).
   * Errors are ignored so stale data remains visible.
   */
  refreshPoolData: () => Promise<void>;
}

const PoolPageContext = createContext<PoolPageContextValue | null>(null);

export function usePoolPage() {
  const ctx = useContext(PoolPageContext);
  if (!ctx) {
    throw new Error('usePoolPage must be used within PoolPageProvider');
  }
  return ctx;
}

interface PoolPageProviderProps {
  value: PoolPageContextValue;
  children: ReactNode;
}

export function PoolPageProvider({ value, children }: PoolPageProviderProps) {
  return (
    <PoolPageContext.Provider value={value}>
      {children}
    </PoolPageContext.Provider>
  );
}
