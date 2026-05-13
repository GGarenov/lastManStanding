import { Badge } from '~/components/Badge/Badge';
import { cn } from '~/lib/utils';
import type { StatusBadgeProps } from './StatusBadge.interface';
import styles from './StatusBadge.module.less';

type StatusModifierClass =
  | 'statusMuted'
  | 'statusPrimaryTint'
  | 'statusSuccessTint'
  | 'statusWarningTint'
  | 'statusDestructiveTint'
  | 'statusRunning';

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; modifierClass: StatusModifierClass }
> = {
  draft: { label: 'Draft', variant: 'secondary', modifierClass: 'statusMuted' },
  open: { label: 'Open', variant: 'default', modifierClass: 'statusPrimaryTint' },
  active: { label: 'Active', variant: 'default', modifierClass: 'statusSuccessTint' },
  completed: { label: 'Completed', variant: 'secondary', modifierClass: 'statusMuted' },
  finished: { label: 'Completed', variant: 'secondary', modifierClass: 'statusMuted' },
  pending: { label: 'Pending', variant: 'outline', modifierClass: 'statusWarningTint' },
  approved: { label: 'Approved', variant: 'default', modifierClass: 'statusSuccessTint' },
  eliminated: { label: 'Eliminated', variant: 'destructive', modifierClass: 'statusDestructiveTint' },
  winner: { label: 'Winner', variant: 'default', modifierClass: 'statusPrimaryTint' },
  upcoming: { label: 'Upcoming', variant: 'secondary', modifierClass: 'statusMuted' },
  running: { label: 'Active', variant: 'outline', modifierClass: 'statusRunning' },
  closed: { label: 'Closed', variant: 'secondary', modifierClass: 'statusMuted' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge
      variant={config.variant}
      className={cn(styles.badgeMod, styles[config.modifierClass], className)}
    >
      {config.label}
    </Badge>
  );
}
