import { apiClient, setAuthToken } from './client';
import type { AxiosError } from 'axios';
import type { LoginResponse } from './types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
  setAuthToken(null);
}

export async function register(payload: RegisterPayload): Promise<{ message?: string }> {
  const { data } = await apiClient.post('/auth/register', payload);
  return data;
}

export async function getMe(): Promise<LoginResponse['user'] | null> {
  const { data } = await apiClient.get<LoginResponse['user']>('/auth/me');
  return data ?? null;
}

/** Extract a user-facing message from a failed API call. */
export function getApiErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return error instanceof Error ? error.message : null;
  }

  const axiosError = error as AxiosError<{ message?: string | string[] }>;
  const message = axiosError.response?.data?.message;

  if (typeof message === 'string') return message;
  if (Array.isArray(message) && message.length > 0) {
    return message.join(', ');
  }

  return axiosError.message || null;
}
