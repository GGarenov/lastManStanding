import { create } from 'zustand';
import * as usersApi from '~/api/users.api';

type UserFromApi = Awaited<ReturnType<typeof usersApi.getUsers>>[number];

interface UsersState {
  users: UserFromApi[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  users: [] as UserFromApi[],
  isLoading: false,
  error: null as string | null,
};

export const useUsersStore = create<UsersState>((set) => ({
  ...initialState,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await usersApi.getUsers();
      set({ users, isLoading: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load users';
      set({ error: message, isLoading: false, users: [] });
    }
  },

  reset: () => set(initialState),
}));
