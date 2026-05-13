import Flag from 'react-world-flags';
import { cn } from '~/lib/utils';
import {
  getTeamFlagCode,
  getTeamDisplayName,
  isUnknownTeam,
} from '~/config/tournaments';
import type { TeamFlagProps } from './TeamFlag.interface';
import styles from './TeamFlag.module.less';

/**
 * Renders a team flag using react-world-flags, or text for TBA/unknown teams.
 * Pass either (code) or (teamName + tournamentConfig). For TBA/unknown, renders text only.
 */
export function TeamFlag({
  code: codeProp,
  teamName = 'TBA',
  tournamentConfig,
  height = 24,
  width,
  className,
}: TeamFlagProps) {
  const code =
    codeProp ??
    (tournamentConfig && teamName ? getTeamFlagCode(teamName, tournamentConfig) : null);
  const displayName =
    tournamentConfig && teamName ? getTeamDisplayName(teamName, tournamentConfig) : teamName;

  const hasValidCode =
    code &&
    typeof code === 'string' &&
    code.trim().length >= 2;

  if (!hasValidCode || isUnknownTeam(teamName)) {
    return (
      <span className={cn(styles.textFallback, className)}>
        {displayName?.trim() || 'TBA'}
      </span>
    );
  }

  const size = width ?? height;
  return (
    <Flag
      code={code.toLowerCase()}
      height={height}
      width={size}
      className={cn(styles.flagImage, className)}
      fallback={
        <span className={cn(styles.textFallback, className)}>
          {displayName || '?'}
        </span>
      }
    />
  );
}
