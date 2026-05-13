import { create } from 'zustand';
import { AxiosError } from 'axios';
import * as adminApi from '~/api/admin.api';

type PoolFromApi = Awaited<ReturnType<typeof adminApi.getPools>>[number];

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof AxiosError && e.response?.data) {
    const data = e.response.data as { message?: string | string[] };
    if (typeof data.message === 'string') return data.message;
    if (Array.isArray(data.message)) return data.message.join(', ');
  }
  return e instanceof Error ? e.message : fallback;
}

interface PoolsState {
  pools: PoolFromApi[];
  isLoading: boolean;
  error: string | null;
  fetchPools: () => Promise<void>;
  deletePool: (poolId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  pools: [] as PoolFromApi[],
  isLoading: false,
  error: null as string | null,
};

export const usePoolsStore = create<PoolsState>((set, get) => ({
  ...initialState,

  fetchPools: async () => {
    set({ isLoading: true, error: null });
    try {
      const pools = await adminApi.getPools();
      set({ pools, isLoading: false });
    } catch (e: unknown) {
      const message = getErrorMessage(e, 'Failed to load pools');
      set({ error: message, isLoading: false });
      // Keep previous pools so UI still shows last known list (e.g. after start-pool validation error).
    }
  },

  deletePool: async (poolId: string) => {
    try {
      await adminApi.deletePool(poolId);
      set((state) => ({
        pools: state.pools.filter((p) => p.id !== poolId),
      }));
    } catch (e: unknown) {
      const message = getErrorMessage(e, 'Failed to delete pool');
      set({ error: message });
      throw e;
    }
  },

  reset: () => set(initialState),
}));
