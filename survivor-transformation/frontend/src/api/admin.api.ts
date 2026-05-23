import { apiClient, normalizeId, normalizeList } from './client';
import type {
  BackendPool,
  BackendParticipant,
  BackendRound,
} from './types';

// --- Pools ---

export interface CreatePoolPayload {
  name: string;
  description?: string;
  tournamentKey?: string;
}

export async function createPool(payload: CreatePoolPayload) {
  const { data } = await apiClient.post<BackendPool>('/admin/pool', payload);
  return normalizeId(data);
}

export interface UpdatePoolPayload {
  name?: string;
  description?: string;
  status?: 'open' | 'active' | 'finished';
  tournamentKey?: string;
}

export async function updatePool(poolId: string, payload: UpdatePoolPayload) {
  const { data } = await apiClient.patch<BackendPool>(
    `/admin/pool/${poolId}`,
    payload
  );
  return normalizeId(data);
}

export async function deletePool(poolId: string) {
  await apiClient.delete(`/admin/pool/${poolId}`);
}

export async function startPool(poolId: string) {
  await apiClient.post<{ message: string }>(
    `/admin/pool/${poolId}/start`
  );
}

export async function getPools() {
  const { data } = await apiClient.get<BackendPool[]>('/admin/pools');
  return normalizeList(data ?? []);
}

// --- Participants ---

export async function getParticipants(poolId: string) {
  const { data } = await apiClient.get<BackendParticipant[]>(
    `/admin/pool/${poolId}/participants`
  );
  return normalizeList(data ?? []);
}

export async function approveParticipant(participantId: string) {
  const { data } = await apiClient.patch<BackendParticipant>(
    `/admin/participant/${participantId}/approve`,
    {}
  );
  return normalizeId(data);
}

export interface UpdateParticipantPayload {
  status?: 'pending' | 'approved' | 'rejected' | 'winner';
}

export async function updateParticipant(
  participantId: string,
  payload: UpdateParticipantPayload
) {
  const { data } = await apiClient.patch<BackendParticipant>(
    `/admin/participant/${participantId}`,
    payload
  );
  return normalizeId(data);
}

export async function deleteParticipant(participantId: string) {
  await apiClient.delete(`/admin/participant/${participantId}`);
}

// --- Rounds ---

export async function getRounds(poolId: string) {
  const { data } = await apiClient.get<BackendRound[]>(
    `/admin/pool/${poolId}/rounds`
  );
  return normalizeList(data ?? []);
}

export interface AddRoundPayload {
  roundNumber: number;
  matches: { homeTeam: string; awayTeam: string }[];
  /** ISO 8601. Optional; when set, picks are only allowed before this time. */
  pickDeadline?: string;
}

export async function addRound(poolId: string, payload: AddRoundPayload) {
  const { data } = await apiClient.post<BackendRound>(
    `/admin/pool/${poolId}/round`,
    payload
  );
  return normalizeId(data);
}

export interface UpdateRoundPayload {
  matches?: { homeTeam: string; awayTeam: string }[];
  isClosed?: boolean;
  /** ISO 8601. Optional; when set, picks are only allowed before this time. Send null to clear. */
  pickDeadline?: string | null;
}

export async function updateRound(
  poolId: string,
  roundNumber: number,
  payload: UpdateRoundPayload
) {
  const { data } = await apiClient.patch<BackendRound>(
    `/admin/pool/${poolId}/round/${roundNumber}`,
    payload
  );
  return normalizeId(data);
}

export async function deleteRound(poolId: string, roundNumber: number) {
  await apiClient.delete(
    `/admin/pool/${poolId}/round/${roundNumber}`
  );
}

export interface MatchResultPayload {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
}

export async function recordRoundResults(
  poolId: string,
  roundNumber: number,
  results: MatchResultPayload[]
) {
  await apiClient.post(
    `/admin/pool/${poolId}/round/${roundNumber}/results`,
    { results }
  );
}

// --- Users ---

export async function deleteUser(userId: string) {
  await apiClient.delete(`/admin/user/${userId}`);
}
