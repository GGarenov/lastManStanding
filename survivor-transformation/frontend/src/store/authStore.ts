import { create } from 'zustand';
import { setAuthToken, hasAuthToken } from '~/api/client';
import * as authApi from '~/api/auth.api';
import { queryClient } from '~/lib/queryClient';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  role?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isChecked: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadMe: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

/** Helper: true when current user has admin role */
export function isAdminUser(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}

function mapUser(
  backend: { _id?: string; sub?: string; id?: string; email?: string; username?: string; role?: string } | null
): AuthUser | null {
  if (!backend) return null;
  const id = backend.sub ?? backend._id ?? backend.id;
  if (!id) return null;
  return {
    id,
    email: backend.email ?? '',
    username: backend.username,
    role: backend.role,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isChecked: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      queryClient.clear();
      const res = await authApi.login({ email, password });
      set({ user: mapUser(res.user), isLoading: false, isChecked: true });
    } catch {
      set({ isLoading: false });
      throw new Error('Login failed');
    }
  },

  register: async (email: string, username: string, password: string) => {
    set({ isLoading: true });
    try {
      await authApi.register({ email, username, password });
      await get().login(email, password);
    } catch {
      set({ isLoading: false });
      throw new Error('Registration failed');
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      setAuthToken(null);
      queryClient.clear();
      set({ user: null });
    }
  },

  loadMe: async () => {
    if (get().isChecked) return;
    // Skip /auth/me when no token - avoids 403 on first visit
    if (!hasAuthToken()) {
      set({ user: null, isLoading: false, isChecked: true });
      return;
    }
    set({ isLoading: true });
    try {
      const user = await authApi.getMe();
      set({
        user: mapUser(user ?? null),
        isLoading: false,
        isChecked: true,
      });
    } catch {
      setAuthToken(null);
      queryClient.clear();
      set({ user: null, isLoading: false, isChecked: true });
    }
  },

  setUser: (user) => set({ user }),
}));
