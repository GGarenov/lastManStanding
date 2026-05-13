import { PoolStatus, ParticipantStatus } from '~/types/pool';

export interface StatusBadgeProps {
  status: PoolStatus | ParticipantStatus | 'upcoming' | 'active' | 'closed' | 'open' | 'running';
  className?: string;
}
