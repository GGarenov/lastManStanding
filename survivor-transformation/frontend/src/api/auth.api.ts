import { apiClient, setAuthToken } from './client';
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
