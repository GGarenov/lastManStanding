import { apiClient, normalizeList } from './client';
import type { BackendUser } from './types';

export async function getUsers() {
  const { data } = await apiClient.get<BackendUser[]>('/users');
  return normalizeList(data ?? []);
}

export interface RegisteredUserPublic {
  firstName: string;
  lastName: string;
}

export async function getRegisteredUsers() {
  const { data } = await apiClient.get<RegisteredUserPublic[]>('/users/registered');
  return normalizeList(data ?? []);
}
