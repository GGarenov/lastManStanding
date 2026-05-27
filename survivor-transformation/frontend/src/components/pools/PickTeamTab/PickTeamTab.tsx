import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePoolPage } from '~/contexts/PoolPageContext';
import { useAuthStore } from '~/store/authStore';
import { TeamFlag } from '~/components/TeamFlag/TeamFlag';
import { Card, CardContent } from '~/components/Card/Card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/AlertDialog/AlertDialog';
import { Check, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { TournamentConfig } from '~/config/tournaments/types';
import type { ParticipantRound, ParticipantMatch } from '~/api/pools.api';
import * as poolsApi from '~/api/pools.api';
import { toast } from 'sonner';
import styles from './PickTeamTab.module.less';

/** Derives stage label from round number (hardcoded for common tournament structure). */
function getStageLabel(roundNumber: number): string {
  const labels: Record<number, string> = {
    1: 'Group Stage',
    2: 'Round of 16',
    3: 'Quarter-finals',
    4: 'Semi-finals',
    5: 'Final',
  };
  return labels[roundNumber] ?? `Round ${roundNumber}`;
}

/** Returns the active round (first with isClosed: false), or undefined if none. */
function getActiveRound(rounds: ParticipantRound[]): ParticipantRound | undefined {
  return rounds.find((r) => !r.isClosed);
}

interface MatchCardProps {
  match: ParticipantMatch;
  tournamentConfig: TournamentConfig | null;
  onSelectTeam: (team: string) => void;
  isDisabled: boolean;
  isSubmitting: boolean;
  /** Set of team names the user has already picked in any previous round */
  usedTeamNames: Set<string>;
}

function MatchCard({ match, tournamentConfig, onSelectTeam, isDisabled, isSubmitting, usedTeamNames }: MatchCardProps) {
  const TeamSlot = ({
    team,
    align,
    children,
  }: {
    team: string;
    align: 'left' | 'right';
    children: React.ReactNode;
  }) => {
    const isUsed = usedTeamNames.has(team);
    const baseClasses = [
      styles.teamSlot,
      align === 'right' ? styles.teamSlotRight : styles.teamSlotLeft,
      isUsed && styles.teamSlotUsed,
    ]
      .filter(Boolean)
      .join(' ');
    const innerClasses = [
      styles.teamSlotInner,
      align === 'right' ? styles.teamSlotInnerRight : '',
    ]
      .filter(Boolean)
      .join(' ');

    if (isUsed) {
      return (
        <div
          className={baseClasses}
          role="group"
          aria-label={`${team}, used`}
        >
          <div className={innerClasses}>
            {children}
          </div>
          <span className={styles.usedBadge}>USED</span>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onSelectTeam(team)}
        disabled={isDisabled || isSubmitting}
        aria-label={`${team}, select`}
        className={[
          baseClasses,
          styles.teamSlotButton,
          !(isDisabled || isSubmitting) ? styles.teamSlotButtonEnabled : styles.teamSlotButtonDisabled,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={innerClasses}>{children}</div>
      </button>
    );
  };

  return (
    <Card className={styles.matchCard}>
      <CardContent className={styles.matchContent}>
        <TeamSlot team={match.homeTeam} align="left">
          <TeamFlag
            teamName={match.homeTeam}
            tournamentConfig={tournamentConfig}
            height={32}
            className={[
              styles.flag,
              usedTeamNames.has(match.homeTeam) ? styles.flagUsed : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
          <span className={styles.teamName} title={match.homeTeam}>{match.homeTeam}</span>
        </TeamSlot>
        <span className={styles.vsLabel}>VS</span>
        <TeamSlot team={match.awayTeam} align="right">
          <span className={styles.teamName} title={match.awayTeam}>{match.awayTeam}</span>
          <TeamFlag
            teamName={match.awayTeam}
            tournamentConfig={tournamentConfig}
            height={32}
            className={[
              styles.flag,
              usedTeamNames.has(match.awayTeam) ? styles.flagUsed : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        </TeamSlot>
      </CardContent>
    </Card>
  );
}

function getErrorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'response' in e) {
    const res = (e as { response?: { data?: { message?: string | string[] } } }).response;
    const msg = res?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(', ');
  }
  return e instanceof Error ? e.message : 'Failed to submit pick.';
}

export function PickTeamTab() {
  const { poolId, rounds, tournamentConfig, poolInfo } = usePoolPage();
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const [myPicks, setMyPicks] = useState<poolsApi.MyPick[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingPickTeam, setPendingPickTeam] = useState<string | null>(null);

  const activeRound = getActiveRound(rounds);
  const deadlinePassed =
    !!activeRound?.pickDeadline && new Date() >= new Date(activeRound.pickDeadline);
  const myPickForRound = activeRound
    ? myPicks.find((p) => p.round === activeRound.roundNumber)?.team ?? null
    : null;
  const usedTeamNames = new Set(myPicks.map((p) => p.team));
  const isPickingDisabled =
    !!poolInfo?.eliminated ||
    (activeRound?.isClosed ?? true) ||
    !!myPickForRound ||
    deadlinePassed;

  useEffect(() => {
    if (!poolId) return;
    poolsApi.getMyPicks(poolId).then(setMyPicks).catch(() => setMyPicks([]));
  }, [poolId]);

  const handleSelectTeam = (team: string) => {
    if (isPickingDisabled || isSubmitting) return;
    setPendingPickTeam(team);
  };

  const handleConfirmPick = async () => {
    if (!poolId || !pendingPickTeam || !activeRound) return;
    setIsSubmitting(true);
    try {
      await poolsApi.submitPick(poolId, pendingPickTeam);
      toast.success(`You picked ${pendingPickTeam}`);
      const updated = await poolsApi.getMyPicks(poolId);
      setMyPicks(updated);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['myPicks', poolId, userId] }),
        queryClient.invalidateQueries({
          queryKey: ['roundStats', poolId, activeRound.roundNumber, userId],
        }),
      ]);
      setPendingPickTeam(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeRound) {
    return (
      <Card>
        <CardContent className={styles.matchesEmptyCard}>
          No active round. Check back when the next round opens for picks.
        </CardContent>
      </Card>
    );
  }

  const stageLabel = getStageLabel(activeRound.roundNumber);
  const heading = `Round ${activeRound.roundNumber} – ${stageLabel}`;

  return (
    <div className={styles.page}>
      <div className={styles.headingBlock}>
        <h2 className={styles.heading}>{heading}</h2>
        {deadlinePassed ? (
          <p className={styles.headingNote}>
            Picks are locked for this round.
          </p>
        ) : !myPickForRound ? (
          <p className={styles.headingNote}>
            You must pick a team this round. If you don&apos;t pick before results are recorded, you will be eliminated.
          </p>
        ) : null}
        {!deadlinePassed && activeRound.pickDeadline && (
          <p className={styles.deadlineRow}>
            <Clock className="h-4 w-4" aria-hidden />
            Picks close at {format(new Date(activeRound.pickDeadline), "EEEE, d MMM yyyy 'at' HH:mm")}
          </p>
        )}
      </div>

      {myPickForRound && (
        <Card className={styles.highlightCard}>
          <CardContent className={styles.highlightContent}>
          <span className={styles.highlightLabel}>Your pick:</span>
          <TeamFlag
            teamName={myPickForRound}
            tournamentConfig={tournamentConfig}
            height={24}
          />
          <span className={styles.highlightTeam}>{myPickForRound}</span>
          </CardContent>
        </Card>
      )}

      {myPicks.length > 0 && (
        <section aria-label="Teams already used" className={styles.usedSection}>
          <h3 className={styles.usedTitle}>
            × Teams already used (cannot pick again)
          </h3>
          <div
            className={styles.usedChips}
            role="list"
            aria-label="Teams you have already picked"
          >
            {myPicks.map((pick) => (
              <div
                key={pick.team}
                role="listitem"
                className={styles.usedChip}
              >
                <TeamFlag
                  teamName={pick.team}
                  tournamentConfig={tournamentConfig}
                  height={20}
                  className={styles.flag}
                />
                <span className={styles.usedChipName}>
                  {pick.team}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeRound.matches.length === 0 ? (
        <Card>
          <CardContent className={styles.matchesEmptyCard}>
            No matches in this round yet.
          </CardContent>
        </Card>
      ) : (
        <div className={styles.matchesGrid}>
          {activeRound.matches.map((match, idx) => (
            <MatchCard
              key={idx}
              match={match}
              tournamentConfig={tournamentConfig}
              onSelectTeam={handleSelectTeam}
              isDisabled={isPickingDisabled}
              isSubmitting={isSubmitting}
              usedTeamNames={usedTeamNames}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={pendingPickTeam !== null}
        onOpenChange={(open) => !open && setPendingPickTeam(null)}
      >
        <AlertDialogContent className={styles.confirmContent}>
          <AlertDialogHeader>
            <AlertDialogTitle>Your pick for this round</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingPickTeam &&
                `Do you confirm that you pick ${pendingPickTeam}? You will not be able to pick ${pendingPickTeam} again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={styles.confirmFooter}>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmPick();
              }}
              disabled={isSubmitting}
              className={styles.confirmButton}
            >
              {isSubmitting ? (
                'Confirming…'
              ) : (
                <>
                  <Check className={styles.confirmIcon} />
                  Confirm Pick
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
