import axios, { AxiosError } from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AUTH_TOKEN_KEY = 'auth_token';

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

let authToken: string | null = getStoredToken();

/** Check if we have a stored auth token (for skipping /auth/me when not logged in) */
export function hasAuthToken(): boolean {
  return !!(authToken ?? getStoredToken());
}

export function setAuthToken(token: string | null) {
  authToken = token;
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // localStorage not available (e.g. SSR)
  }
}

apiClient.interceptors.request.use((config) => {
  const token = authToken ?? getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

/** Normalize MongoDB _id to id for frontend use */
export function normalizeId<T extends { _id?: string }>(obj: T): Omit<T, '_id'> & { id: string } {
  if (!obj) return obj as any;
  const { _id, ...rest } = obj as T & { _id?: string };
  return { ...rest, id: _id ?? (obj as any).id } as Omit<T, '_id'> & { id: string };
}

export function normalizeList<T extends { _id?: string }>(
  list: T[]
): (Omit<T, '_id'> & { id: string })[] {
  return list.map(normalizeId);
}
