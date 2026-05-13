import { apiClient, normalizeList } from './client';
import type { BackendUser } from './types';

export async function getUsers() {
  const { data } = await apiClient.get<BackendUser[]>('/users');
  return normalizeList(data ?? []);
}
