import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "~/store/authStore";
import { useLocalizedPath } from "~/i18n/routing";
import {
  clearPendingPick,
  readPendingPick,
  rememberPendingPick,
} from "~/lib/pendingPick";
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
  /** Team to emphasise (the one a guest clicked before logging in). */
  highlightedTeam?: string | null;
  labels: PickTeamLabels;
}

function MatchCard({
  match,
  tournamentConfig,
  onSelectTeam,
  isDisabled,
  isSubmitting,
  usedTeamNames,
  highlightedTeam = null,
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
        aria-pressed={highlightedTeam === team ? true : undefined}
        className={[
          baseClasses,
          styles.teamSlotButton,
          !(isDisabled || isSubmitting)
            ? styles.teamSlotButtonEnabled
            : styles.teamSlotButtonDisabled,
          highlightedTeam === team && styles.teamSlotHighlighted,
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
  const { poolId, rounds, tournamentConfig, poolInfo, isSpectator } =
    usePoolPage();
  const { t } = useLabels("pool");
  const { t: tCommon } = useLabels("common");
  const { pickTeam: pickLabels, confirm: confirmLabels } = useMemo(
    () => buildPoolLabels(t, tCommon),
    [t, tCommon],
  );

  const isLoggedIn = useAuthStore((s) => s.user !== null);
  const navigate = useNavigate();
  const location = useLocation();
  const localizedPath = useLocalizedPath();

  const [myPicks, setMyPicks] = useState<poolsApi.MyPick[]>([]);
  const [myPicksLoaded, setMyPicksLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingPickTeam, setPendingPickTeam] = useState<string | null>(null);
  /** Team a guest clicked before logging in (sessionStorage), highlighted for spectators. */
  const [rememberedTeam, setRememberedTeam] = useState<string | null>(null);

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
    setMyPicksLoaded(false);
    // Spectators have no picks; the member-only endpoint would reject them.
    if (!poolId || isSpectator) {
      setMyPicks([]);
      setMyPicksLoaded(true);
      return;
    }
    let cancelled = false;
    poolsApi
      .getMyPicks(poolId)
      .then((picks) => !cancelled && setMyPicks(picks))
      .catch(() => !cancelled && setMyPicks([]))
      .finally(() => !cancelled && setMyPicksLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [poolId, isSpectator]);

  // A team clicked before logging in: members get the confirm dialog for it (they still confirm);
  // spectators see it highlighted.
  const activeRoundNumber = activeRound?.roundNumber ?? null;
  useEffect(() => {
    if (!poolId || activeRoundNumber === null || !myPicksLoaded) return;
    const remembered = readPendingPick(poolId, activeRoundNumber)?.team ?? null;
    if (!remembered) {
      setRememberedTeam(null);
      return;
    }
    const inRound = activeRound?.matches.some(
      (m) => m.homeTeam === remembered || m.awayTeam === remembered,
    );
    if (!inRound) {
      clearPendingPick();
      setRememberedTeam(null);
      return;
    }
    if (isSpectator) {
      setRememberedTeam(remembered);
      return;
    }
    clearPendingPick();
    setRememberedTeam(null);
    if (!isPickingDisabled && !usedTeamNames.has(remembered)) {
      setPendingPickTeam(remembered);
    }
    // Runs once per pool/round/viewer state; the derived values are read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolId, activeRoundNumber, myPicksLoaded, isSpectator]);

  /** Spectator click → log in, wait for approval, or buy in. */
  const handleSpectatorSelect = (team: string) => {
    if (!isLoggedIn) {
      if (poolId && activeRoundNumber !== null) {
        rememberPendingPick({ poolId, round: activeRoundNumber, team });
      }
      toast.info(pickLabels.loginToPick);
      navigate(localizedPath("/login"), { state: { from: location.pathname } });
      return;
    }
    if (poolInfo?.status === "pending") {
      toast.info(pickLabels.pendingApproval);
      return;
    }
    // Joining is only possible while the pool is open.
    if (poolInfo?.poolStatus !== "open") {
      toast.info(pickLabels.poolStarted);
      return;
    }
    clearPendingPick();
    toast.info(pickLabels.buyInToPick);
    navigate(localizedPath("/my-pool"));
  };

  const handleSelectTeam = (team: string) => {
    if (isPickingDisabled || isSubmitting) return;
    if (isSpectator) {
      handleSpectatorSelect(team);
      return;
    }
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
        ) : isSpectator ? (
          <p className={styles.headingNote}>
            {rememberedTeam
              ? pickLabels.rememberedPick(rememberedTeam)
              : pickLabels.spectatorNote}
          </p>
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
              highlightedTeam={rememberedTeam}
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
