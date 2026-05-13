import { create } from 'zustand';
import { AxiosError } from 'axios';
import * as poolsApi from '~/api/pools.api';
import type { OpenPool, MyPoolStatus } from '~/api/pools.api';
import { useAuthStore } from './authStore';

type PoolWithStatus = OpenPool & { myStatus: MyPoolStatus };

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof AxiosError && e.response?.data) {
    const data = e.response.data as { message?: string | string[] };
    if (typeof data.message === 'string') return data.message;
    if (Array.isArray(data.message)) return data.message.join(', ');
  }
  return e instanceof Error ? e.message : fallback;
}

interface OpenPoolsState {
  pools: PoolWithStatus[];
  isLoading: boolean;
  error: string | null;
  joiningId: string | null;
  fetchPools: () => Promise<void>;
  joinPool: (poolId: string) => Promise<void>;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  pools: [] as PoolWithStatus[],
  isLoading: false,
  error: null as string | null,
  joiningId: null as string | null,
};

export const useOpenPoolsStore = create<OpenPoolsState>((set, get) => ({
  ...initialState,

  fetchPools: async () => {
    set({ isLoading: true, error: null });
    const user = useAuthStore.getState().user;
    try {
      const list = await poolsApi.getOpenPools();
      const withStatus: PoolWithStatus[] = await Promise.all(
        list.map(async (pool) => {
          if (!user) return { ...pool, myStatus: 'none' as MyPoolStatus };
          try {
            const { status } = await poolsApi.getMyPoolStatus(pool.id);
            return { ...pool, myStatus: status };
          } catch {
            return { ...pool, myStatus: 'none' as MyPoolStatus };
          }
        })
      );
      set({ pools: withStatus, isLoading: false });
    } catch (e: unknown) {
      const message = getErrorMessage(e, 'Could not load pools. Please try again.');
      set({ error: message, isLoading: false });
      // Keep previous pools so UI still shows last known list (e.g. after a failed refetch).
    }
  },

  joinPool: async (poolId: string) => {
    set({ joiningId: poolId, error: null });
    try {
      await poolsApi.joinPool(poolId);
      set((state) => ({
        pools: state.pools.map((p) =>
          p.id === poolId ? { ...p, myStatus: 'pending' as MyPoolStatus } : p
        ),
        joiningId: null,
      }));
    } catch (e: unknown) {
      const message = getErrorMessage(e, 'Failed to join pool.');
      set({ error: message, joiningId: null });
      throw e;
    }
  },

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
