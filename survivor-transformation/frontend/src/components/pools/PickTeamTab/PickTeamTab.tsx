import { useState, useEffect, useMemo } from "react";
import { formatAppDate } from "~/i18n/dateLocale";
import { Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { useLabels } from "~/hooks/useLabels";
import { usePoolPage } from "~/contexts/PoolPageContext";
import { TeamFlag } from "~/components/TeamFlag/TeamFlag";
import { Card, CardContent } from "~/components/Card/Card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/AlertDialog/AlertDialog";
import type { TournamentConfig } from "~/config/tournaments/types";
import type { ParticipantRound, ParticipantMatch } from "~/api/pools.api";
import * as poolsApi from "~/api/pools.api";
import { buildPoolLabels, type PoolLabels } from "~/locales/labels/pool.labels";
import styles from "./PickTeamTab.module.less";

function getActiveRound(
  rounds: ParticipantRound[],
): ParticipantRound | undefined {
  return rounds.find((r) => !r.isClosed);
}

type PickTeamLabels = PoolLabels["pickTeam"];
type ConfirmLabels = PoolLabels["confirm"];

interface MatchCardProps {
  match: ParticipantMatch;
  tournamentConfig: TournamentConfig | null;
  onSelectTeam: (team: string) => void;
  isDisabled: boolean;
  isSubmitting: boolean;
  usedTeamNames: Set<string>;
  labels: PickTeamLabels;
}

function MatchCard({
  match,
  tournamentConfig,
  onSelectTeam,
  isDisabled,
  isSubmitting,
  usedTeamNames,
  labels,
}: MatchCardProps) {
  const TeamSlot = ({
    team,
    align,
    children,
  }: {
    team: string;
    align: "left" | "right";
    children: React.ReactNode;
  }) => {
    const isUsed = usedTeamNames.has(team);
    const baseClasses = [
      styles.teamSlot,
      align === "right" ? styles.teamSlotRight : styles.teamSlotLeft,
      isUsed && styles.teamSlotUsed,
    ]
      .filter(Boolean)
      .join(" ");
    const innerClasses = [
      styles.teamSlotInner,
      align === "right" ? styles.teamSlotInnerRight : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (isUsed) {
      return (
        <div
          className={baseClasses}
          role="group"
          aria-label={labels.teamUsedAria(team)}
        >
          <div className={innerClasses}>{children}</div>
          <span className={styles.usedBadge}>{labels.usedBadge}</span>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onSelectTeam(team)}
        disabled={isDisabled || isSubmitting}
        aria-label={labels.teamSelectAria(team)}
        className={[
          baseClasses,
          styles.teamSlotButton,
          !(isDisabled || isSubmitting)
            ? styles.teamSlotButtonEnabled
            : styles.teamSlotButtonDisabled,
        ]
          .filter(Boolean)
          .join(" ")}
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
              usedTeamNames.has(match.homeTeam) ? styles.flagUsed : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
          <span className={styles.teamName} title={match.homeTeam}>
            {match.homeTeam}
          </span>
        </TeamSlot>
        <span className={styles.vsLabel}>{labels.vs}</span>
        <TeamSlot team={match.awayTeam} align="right">
          <span className={styles.teamName} title={match.awayTeam}>
            {match.awayTeam}
          </span>
          <TeamFlag
            teamName={match.awayTeam}
            tournamentConfig={tournamentConfig}
            height={32}
            className={[
              styles.flag,
              usedTeamNames.has(match.awayTeam) ? styles.flagUsed : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        </TeamSlot>
      </CardContent>
    </Card>
  );
}

function getErrorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "response" in e) {
    const res = (e as { response?: { data?: { message?: string | string[] } } })
      .response;
    const msg = res?.data?.message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg.join(", ");
  }
  return e instanceof Error ? e.message : fallback;
}

export function PickTeamTab() {
  const { poolId, rounds, tournamentConfig, poolInfo } = usePoolPage();
  const { t } = useLabels("pool");
  const { t: tCommon } = useLabels("common");
  const { pickTeam: pickLabels, confirm: confirmLabels } = useMemo(
    () => buildPoolLabels(t, tCommon),
    [t, tCommon],
  );

  const [myPicks, setMyPicks] = useState<poolsApi.MyPick[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingPickTeam, setPendingPickTeam] = useState<string | null>(null);

  const activeRound = getActiveRound(rounds);
  const deadlinePassed =
    !!activeRound?.pickDeadline &&
    new Date() >= new Date(activeRound.pickDeadline);
  const myPickForRound = activeRound
    ? (myPicks.find((p) => p.round === activeRound.roundNumber)?.team ?? null)
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
    if (!poolId || !pendingPickTeam) return;
    setIsSubmitting(true);
    try {
      await poolsApi.submitPick(poolId, pendingPickTeam);
      toast.success(pickLabels.pickSuccess(pendingPickTeam));
      const updated = await poolsApi.getMyPicks(poolId);
      setMyPicks(updated);
      setPendingPickTeam(null);
    } catch (e) {
      toast.error(getErrorMessage(e, pickLabels.submitFailed));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeRound) {
    return (
      <Card>
        <CardContent className={styles.matchesEmptyCard}>
          {pickLabels.noActiveRound}
        </CardContent>
      </Card>
    );
  }

  const stageLabel = pickLabels.getStageLabel(
    activeRound.roundNumber,
    poolInfo?.tournamentKey,
  );
  const heading = pickLabels.roundHeading(activeRound.roundNumber, stageLabel);

  return (
    <div className={styles.page}>
      <div className={styles.headingBlock}>
        <h2 className={styles.heading}>{heading}</h2>
        {deadlinePassed ? (
          <p className={styles.headingNote}>{pickLabels.picksLocked}</p>
        ) : !myPickForRound ? (
          <p className={styles.headingNote}>{pickLabels.mustPick}</p>
        ) : null}
        {!deadlinePassed && activeRound.pickDeadline && (
          <p className={styles.deadlineRow}>
            <Clock className="h-4 w-4" aria-hidden />
            {pickLabels.picksCloseAt(
              formatAppDate(
                new Date(activeRound.pickDeadline),
                "EEEE, d MMM yyyy 'at' HH:mm",
              ),
            )}
          </p>
        )}
      </div>

      {myPickForRound && (
        <Card className={styles.highlightCard}>
          <CardContent className={styles.highlightContent}>
            <span className={styles.highlightLabel}>{pickLabels.yourPick}</span>
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
        <section
          aria-label={pickLabels.teamsUsedSectionAria}
          className={styles.usedSection}
        >
          <h3 className={styles.usedTitle}>{pickLabels.teamsUsedTitle}</h3>
          <div
            className={styles.usedChips}
            role="list"
            aria-label={pickLabels.teamsUsedListAria}
          >
            {myPicks.map((pick) => (
              <div key={pick.team} role="listitem" className={styles.usedChip}>
                <TeamFlag
                  teamName={pick.team}
                  tournamentConfig={tournamentConfig}
                  height={20}
                  className={styles.flag}
                />
                <span className={styles.usedChipName}>{pick.team}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeRound.matches.length === 0 ? (
        <Card>
          <CardContent className={styles.matchesEmptyCard}>
            {pickLabels.noMatches}
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
              labels={pickLabels}
            />
          ))}
        </div>
      )}

      <PickConfirmDialog
        open={pendingPickTeam !== null}
        team={pendingPickTeam}
        isSubmitting={isSubmitting}
        labels={confirmLabels}
        onOpenChange={(open) => !open && setPendingPickTeam(null)}
        onConfirm={handleConfirmPick}
      />
    </div>
  );
}

function PickConfirmDialog({
  open,
  team,
  isSubmitting,
  labels,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  team: string | null;
  isSubmitting: boolean;
  labels: ConfirmLabels;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={styles.confirmContent}>
        <AlertDialogHeader>
          <AlertDialogTitle>{labels.pickTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {team && labels.pickMessage(team)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={styles.confirmFooter}>
          <AlertDialogCancel disabled={isSubmitting}>
            {labels.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isSubmitting}
            className={styles.confirmButton}
          >
            {isSubmitting ? (
              labels.confirming
            ) : (
              <>
                <Check className={styles.confirmIcon} />
                {labels.confirm}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
