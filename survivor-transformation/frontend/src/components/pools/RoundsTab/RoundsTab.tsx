import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '~/components/Card/Card';
import { Button } from '~/components/Button/Button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/Dialog/Dialog';
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
import { Input } from '~/components/Input/Input';
import { Label } from '~/components/Label/Label';
import { DateTimePicker } from '~/components/DateTimePicker/DateTimePicker';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/Accordion/Accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/Tooltip/Tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/Select/Select';
import { Plus, Trash2, ListChecks, Lock, AlertCircle, Pencil } from 'lucide-react';
import { Round, Match, MatchResult } from '~/types/pool';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog';
import { RecordResultsDialog } from '../RecordResultsDialog/RecordResultsDialog';
import { toast } from 'sonner';
import * as adminApi from '~/api/admin.api';
import { toRoundShape } from '~/api/mappers';
import { getApiErrorMessage } from '~/lib/api-utils';
import { AxiosError } from 'axios';
import {
  getTournamentConfig,
  getMaxRounds,
  getPredefinedRound,
} from '~/config/tournaments';
import styles from './RoundsTab.module.less';

/** Format ISO date string to datetime-local value (YYYY-MM-DDTHH:mm) in local time. */
function toDatetimeLocal(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
}

/** Derived round status: Open (picks allowed), Active/Running (deadline passed, not closed), Closed. */
function getRoundDisplayStatus(round: Round): 'open' | 'running' | 'closed' {
  if (round.status === 'closed') return 'closed';
  if (round.deadline && new Date() >= new Date(round.deadline)) return 'running';
  return 'open';
}

interface RoundsTabProps {
  poolId: string;
  isReadOnly?: boolean;
  /** When set, Add match uses team dropdowns from tournament config. */
  tournamentKey?: string;
}

export function RoundsTab({ poolId, isReadOnly, tournamentKey }: RoundsTabProps) {
  const tournamentConfig = tournamentKey ? getTournamentConfig(tournamentKey) : null;
  const teams = tournamentConfig?.teams ?? [];
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addMatchOpen, setAddMatchOpen] = useState<Round | null>(null);
  const [newMatchHome, setNewMatchHome] = useState('');
  const [newMatchAway, setNewMatchAway] = useState('');
  const [isAddingRound, setIsAddingRound] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    round: Round | null;
  }>({ open: false, round: null });
  const [recordResultsRound, setRecordResultsRound] = useState<Round | null>(
    null
  );
  const [confirmResults, setConfirmResults] = useState<{
    open: boolean;
    round: Round | null;
    results: adminApi.MatchResultPayload[] | null;
  }>({ open: false, round: null, results: null });
  const [addRoundDialogOpen, setAddRoundDialogOpen] = useState(false);
  const [addRoundPickDeadline, setAddRoundPickDeadline] = useState('');
  const [editRoundDialogRound, setEditRoundDialogRound] = useState<Round | null>(null);
  const [editRoundDeadline, setEditRoundDeadline] = useState('');

  const fetchRounds = useCallback(async () => {
    if (!poolId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getRounds(poolId);
      setRounds(data.map(toRoundShape));
    } catch (e) {
      // 404 can occur when the endpoint is missing or when no rounds exist yet
      if (e instanceof AxiosError && e.response?.status === 404) {
        setRounds((prev) => (prev.length === 0 ? [] : prev));
      } else {
        setError(getApiErrorMessage(e, 'Failed to load rounds'));
        setRounds([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [poolId]);

  useEffect(() => {
    if (!poolId) return;
    fetchRounds();
  }, [poolId, fetchRounds]);

  const maxRounds = getMaxRounds(tournamentKey);
  const isMaxRoundsReached =
    maxRounds !== null && rounds.length >= maxRounds;

  const nextRoundNumber =
    rounds.length === 0
      ? 1
      : Math.max(...rounds.map((r) => r.number), 0) + 1;

  const handleAddRound = async () => {
    if (!poolId) return;
    setIsAddingRound(true);
    try {
      const predefinedRound = getPredefinedRound(tournamentKey, nextRoundNumber);
      const matches =
        predefinedRound?.matches && predefinedRound.matches.length > 0
          ? predefinedRound.matches
          : [];
      const pickDeadline = addRoundPickDeadline.trim()
        ? new Date(addRoundPickDeadline.trim()).toISOString()
        : undefined;

      const added = await adminApi.addRound(poolId, {
        roundNumber: nextRoundNumber,
        matches,
        ...(pickDeadline && { pickDeadline }),
      });
      toast.success(`Round ${nextRoundNumber} created`);
      const newRound = toRoundShape(added);
      setRounds((prev) => [...prev, newRound]);
      setAddRoundDialogOpen(false);
      setAddRoundPickDeadline('');
      fetchRounds();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to add round'));
    } finally {
      setIsAddingRound(false);
    }
  };

  const openAddRoundDialog = () => {
    const predefined = getPredefinedRound(tournamentKey, nextRoundNumber);
    // Only pre-fill pickDeadline when it's in the future (e.g. for testing). Config often has past dates (EURO 2024).
    const deadlineStr = predefined?.pickDeadline;
    const inFuture =
      deadlineStr && new Date(deadlineStr) > new Date();
    setAddRoundPickDeadline(inFuture ? deadlineStr.slice(0, 16) : '');
    setAddRoundDialogOpen(true);
  };

  const openEditRoundDialog = (round: Round) => {
    setEditRoundDialogRound(round);
    setEditRoundDeadline(toDatetimeLocal(round.deadline));
  };

  const handleSaveEditRound = async () => {
    if (!poolId || !editRoundDialogRound) return;
    try {
      const pickDeadline = editRoundDeadline.trim()
        ? new Date(editRoundDeadline.trim()).toISOString()
        : null;
      await adminApi.updateRound(poolId, editRoundDialogRound.number, {
        pickDeadline,
      });
      toast.success('Round updated');
      setEditRoundDialogRound(null);
      setEditRoundDeadline('');
      fetchRounds();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to update round'));
    }
  };

  const handleAddMatch = async () => {
    const round = addMatchOpen;
    if (!poolId || !round || !newMatchHome.trim() || !newMatchAway.trim()) {
      toast.error('Please enter both team names');
      return;
    }
    const usedInRound = new Set(
      round.matches.flatMap((m) => [m.teamA, m.teamB])
    );
    const homeTrim = newMatchHome.trim();
    const awayTrim = newMatchAway.trim();
    if (usedInRound.has(homeTrim)) {
      toast.error(
        `${homeTrim} is already in a match in this round. A team cannot appear in multiple matches.`
      );
      return;
    }
    if (usedInRound.has(awayTrim)) {
      toast.error(
        `${awayTrim} is already in a match in this round. A team cannot appear in multiple matches.`
      );
      return;
    }
    const newMatches = [
      ...round.matches.map((m) => ({ homeTeam: m.teamA, awayTeam: m.teamB })),
      { homeTeam: newMatchHome.trim(), awayTeam: newMatchAway.trim() },
    ];
    try {
      await adminApi.updateRound(poolId, round.number, { matches: newMatches });
      toast.success('Match added');
      setAddMatchOpen(null);
      setNewMatchHome('');
      setNewMatchAway('');
      fetchRounds();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to add match'));
    }
  };

  const handleDeleteRound = async () => {
    const round = deleteConfirm.round;
    if (!poolId || !round) return;
    try {
      await adminApi.deleteRound(poolId, round.number);
      toast.success('Round deleted');
      setDeleteConfirm({ open: false, round: null });
      fetchRounds();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to delete round'));
    }
  };

  const handleDeleteMatch = async (round: Round, match: Match) => {
    if (!poolId) return;
    const newMatches = round.matches
      .filter((m) => m.id !== match.id)
      .map((m) => ({ homeTeam: m.teamA, awayTeam: m.teamB }));
    try {
      await adminApi.updateRound(poolId, round.number, { matches: newMatches });
      toast.success('Match deleted');
      fetchRounds();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to delete match'));
    }
  };

  const handleRecordResults = (results: adminApi.MatchResultPayload[]) => {
    if (!recordResultsRound) return;
    // Show confirmation dialog instead of immediately submitting
    setConfirmResults({
      open: true,
      round: recordResultsRound,
      results,
    });
    // Close the results input dialog
    setRecordResultsRound(null);
  };

  const handleConfirmRecordResults = async () => {
    if (!poolId || !confirmResults.round || !confirmResults.results) return;
    try {
      await adminApi.recordRoundResults(
        poolId,
        confirmResults.round.number,
        confirmResults.results
      );
      toast.success(
        `Round ${confirmResults.round.number} results recorded. Players eliminated.`
      );
      setConfirmResults({ open: false, round: null, results: null });
      fetchRounds();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to record results'));
      setConfirmResults({ open: false, round: null, results: null });
    }
  };

  const getResultDisplay = (match: Match) => {
    if (match.result === 'team_a') return `${match.teamA} won`;
    if (match.result === 'team_b') return `${match.teamB} won`;
    if (match.result === 'draw') return 'Draw';
    return 'Pending';
  };

  if (error) {
    return (
      <div className={styles.errorPage}>
        <p className={styles.errorText}>{error}</p>
        <Button variant="outline" onClick={() => poolId && fetchRounds()}>
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading && rounds.length === 0) {
    return (
      <div className={styles.loading}>
        Loading rounds...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {!isReadOnly && (
        <div className={styles.toolbar}>
          {isMaxRoundsReached ? (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  className={styles.addRoundButton}
                  disabled
                  aria-label={`Maximum ${maxRounds} rounds for this tournament`}
                >
                  <Plus />
                  Add Round
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Maximum {maxRounds} rounds for this tournament
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <Button
                className={styles.addRoundButton}
                onClick={openAddRoundDialog}
                disabled={isAddingRound}
              >
                <Plus />
                Add Round
              </Button>
              <Dialog
                open={addRoundDialogOpen}
                onOpenChange={(open) => {
                  setAddRoundDialogOpen(open);
                  if (!open) setAddRoundPickDeadline('');
                }}
              >
                <DialogContent className={styles.dialogContent}>
                  <DialogHeader>
                    <DialogTitle>
                      Add Round {nextRoundNumber}
                      {getPredefinedRound(tournamentKey, nextRoundNumber)?.label
                        ? ` – ${getPredefinedRound(tournamentKey, nextRoundNumber)?.label}`
                        : ''}
                    </DialogTitle>
                  </DialogHeader>
                  <div className={styles.dialogBody}>
                    <div className={styles.field}>
                      <Label htmlFor="add-round-pick-deadline">
                        Pick deadline (optional)
                      </Label>
                      <DateTimePicker
                        id="add-round-pick-deadline"
                        value={addRoundPickDeadline}
                        onChange={setAddRoundPickDeadline}
                        placeholder="Select date and time"
                      />
                      <p className={styles.fieldHelpText}>
                        Picks are only accepted before this time. Pre-filled from
                        tournament config when available; you can change it (e.g.
                        for testing).
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAddRoundDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddRound} disabled={isAddingRound}>
                      {isAddingRound ? 'Adding...' : 'Add Round'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      )}

      {rounds.length === 0 ? (
        <Card>
          <CardContent className={styles.emptyCardContent}>
            <p className={styles.emptyTitle}>No rounds created yet</p>
            <p className={styles.emptySubtitle}>
              Add rounds to set up matches for this pool.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className={styles.accordion}>
          {rounds.map((round) => {
            const predefinedRound = getPredefinedRound(
              tournamentKey,
              round.number,
            );
            const roundTitle = predefinedRound?.label
              ? `Round ${round.number} – ${predefinedRound.label}`
              : `Round ${round.number}`;
            return (
            <AccordionItem
              key={round.id}
              value={round.id}
              className={styles.accordionItem}
            >
              <AccordionTrigger className={styles.accordionTrigger}>
                <div className={styles.accordionHeaderRow}>
                  <div className={styles.accordionHeaderLeft}>
                    <span className={styles.roundTitle}>{roundTitle}</span>
                    <StatusBadge status={getRoundDisplayStatus(round)} />
                    {round.status === 'closed' && (
                      <Lock />
                    )}
                  </div>
                  <span className={styles.roundMeta}>
                    {round.matches.length} match
                    {round.matches.length !== 1 ? 'es' : ''}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className={styles.roundContent}>
                {!isReadOnly && round.status !== 'closed' && (
                  <div className={styles.roundActions}>
                    <Button
                      variant="outline"
                      size="sm"
                      className={styles.roundActionButton}
                      onClick={() => openEditRoundDialog(round)}
                    >
                      <Pencil />
                      Edit Round
                    </Button>
                    <Dialog
                      open={addMatchOpen?.id === round.id}
                      onOpenChange={(open) => {
                        setAddMatchOpen(open ? round : null);
                        if (!open) {
                          setNewMatchHome('');
                          setNewMatchAway('');
                        }
                      }}
                    >
                      <DialogTrigger
                        className={`${styles.roundActionButton} ${styles.roundActionButtonOutline}`}
                      >
                        <Plus />
                        Add Match
                      </DialogTrigger>
                      <DialogContent className={styles.dialogContent}>
                        <DialogHeader>
                          <DialogTitle>
                            Add Match to Round {round.number}
                          </DialogTitle>
                        </DialogHeader>
                        <div className={styles.dialogBody}>
                          {teams.length > 0 ? (
                            <>
                              <div className={styles.field}>
                                <Label htmlFor="add-match-home">Home team</Label>
                                <Select
                                  value={newMatchHome || ''}
                                  onValueChange={setNewMatchHome}
                                >
                                  <SelectTrigger
                                    id="add-match-home"
                                  >
                                    <SelectValue placeholder="Select team" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {teams
                                      .filter(
                                        (t) =>
                                          t.displayName !== newMatchAway &&
                                          (!new Set(
                                            round.matches.flatMap((m) => [
                                              m.teamA,
                                              m.teamB,
                                            ])
                                          ).has(t.displayName) ||
                                            t.displayName === newMatchHome)
                                      )
                                      .map((t) => (
                                        <SelectItem
                                          key={t.displayName}
                                          value={t.displayName}
                                        >
                                          {t.displayName}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className={styles.field}>
                                <Label htmlFor="add-match-away">Away team</Label>
                                <Select
                                  value={newMatchAway || ''}
                                  onValueChange={setNewMatchAway}
                                >
                                  <SelectTrigger
                                    id="add-match-away"
                                  >
                                    <SelectValue placeholder="Select team" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {teams
                                      .filter(
                                        (t) =>
                                          t.displayName !== newMatchHome &&
                                          (!new Set(
                                            round.matches.flatMap((m) => [
                                              m.teamA,
                                              m.teamB,
                                            ])
                                          ).has(t.displayName) ||
                                            t.displayName === newMatchAway)
                                      )
                                      .map((t) => (
                                        <SelectItem
                                          key={t.displayName}
                                          value={t.displayName}
                                        >
                                          {t.displayName}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className={styles.manualTeamsInfo}>
                                <AlertCircle />
                                <p>
                                  Set a tournament in pool settings (Edit Pool) to
                                  use team dropdowns and prevent typos. For now you
                                  can enter team names manually below.
                                </p>
                              </div>
                              <div className={styles.field}>
                                <Label htmlFor="add-match-home">Home team</Label>
                                <Input
                                  id="add-match-home"
                                  value={newMatchHome}
                                  onChange={(e) =>
                                    setNewMatchHome(e.target.value)
                                  }
                                  placeholder="Team name"
                                />
                              </div>
                              <div className={styles.field}>
                                <Label htmlFor="add-match-away">Away team</Label>
                                <Input
                                  id="add-match-away"
                                  value={newMatchAway}
                                  onChange={(e) =>
                                    setNewMatchAway(e.target.value)
                                  }
                                  placeholder="Team name"
                                />
                              </div>
                              {(() => {
                                const usedInRoundManual = new Set(
                                  round.matches.flatMap((m) => [
                                    m.teamA,
                                    m.teamB,
                                  ])
                                );
                                const homeUsed = usedInRoundManual.has(
                                  newMatchHome.trim()
                                );
                                const awayUsed = usedInRoundManual.has(
                                  newMatchAway.trim()
                                );
                                if (!homeUsed && !awayUsed) return null;
                                return (
                                  <p className={styles.manualTeamsWarning}>
                                    <AlertCircle />
                                    {homeUsed && awayUsed
                                      ? 'Both teams are already in a match in this round.'
                                      : homeUsed
                                        ? `${newMatchHome.trim()} is already in a match in this round.`
                                        : `${newMatchAway.trim()} is already in a match in this round.`}
                                  </p>
                                );
                              })()}
                            </>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setAddMatchOpen(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddMatch}
                            disabled={
                              !newMatchHome.trim() ||
                              !newMatchAway.trim() ||
                              (teams.length === 0 &&
                                new Set(
                                  round.matches.flatMap((m) => [
                                    m.teamA,
                                    m.teamB,
                                  ])
                                ).has(newMatchHome.trim())) ||
                              (teams.length === 0 &&
                                new Set(
                                  round.matches.flatMap((m) => [
                                    m.teamA,
                                    m.teamB,
                                  ])
                                ).has(newMatchAway.trim()))
                            }
                          >
                            Add Match
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {round.matches.length > 0 && (
                      <Button
                        size="sm"
                        className={styles.roundActionButton}
                        onClick={() => setRecordResultsRound(round)}
                      >
                        <ListChecks />
                        Record Results
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className={styles.roundDeleteButton}
                      onClick={() =>
                        setDeleteConfirm({ open: true, round })
                      }
                    >
                      <Trash2 />
                      Delete Round
                    </Button>
                  </div>
                )}

                {round.matches.length === 0 ? (
                  <p className={styles.matchesEmpty}>No matches in this round yet.</p>
                ) : (
                  <div className={styles.matchList}>
                    {round.matches.map((match) => (
                      <div
                        key={match.id}
                        className={styles.matchRow}
                      >
                        <div className={styles.matchTeams}>
                          <span className={styles.matchTeamName}>{match.teamA}</span>
                          <span className={styles.matchTeamsLabel}>vs</span>
                          <span className={styles.matchTeamName}>{match.teamB}</span>
                        </div>
                        <div className={styles.matchMeta}>
                          <span
                            className={
                              match.result ? styles.matchResultDone : styles.matchResultPending
                            }
                          >
                            {getResultDisplay(match)}
                          </span>
                          {!isReadOnly && round.status !== 'closed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={styles.matchDeleteButton}
                              onClick={() =>
                                handleDeleteMatch(round, match)
                              }
                            >
                              <Trash2 />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          setDeleteConfirm({ ...deleteConfirm, open })
        }
        title="Delete Round"
        description="Are you sure you want to delete this round? All matches in this round will be removed. This cannot be undone."
        confirmLabel="Delete Round"
        variant="destructive"
        onConfirm={handleDeleteRound}
      />

      <Dialog
        open={!!editRoundDialogRound}
        onOpenChange={(open) => {
          if (!open) {
            setEditRoundDialogRound(null);
            setEditRoundDeadline('');
          }
        }}
      >
        <DialogContent className={styles.dialogContent}>
          <DialogHeader>
            <DialogTitle>
              Edit Round {editRoundDialogRound?.number}
              {editRoundDialogRound &&
                getPredefinedRound(tournamentKey, editRoundDialogRound.number)?.label &&
                ` – ${getPredefinedRound(tournamentKey, editRoundDialogRound.number)?.label}`}
            </DialogTitle>
          </DialogHeader>
          <div className={styles.dialogBody}>
            <div className={styles.field}>
              <Label htmlFor="edit-round-pick-deadline">
                Pick deadline (optional)
              </Label>
              <DateTimePicker
                id="edit-round-pick-deadline"
                value={editRoundDeadline}
                onChange={setEditRoundDeadline}
                placeholder="Select date and time"
              />
              <p className={styles.fieldHelpText}>
                Picks are only accepted before this time. Leave empty to clear the
                deadline. Useful for testing (e.g. set to tomorrow 14:00).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditRoundDialogRound(null);
                setEditRoundDeadline('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEditRound}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {recordResultsRound && (
        <RecordResultsDialog
          open={!!recordResultsRound}
          onOpenChange={(open) => !open && setRecordResultsRound(null)}
          round={recordResultsRound}
          onSubmit={handleRecordResults}
        />
      )}

      {confirmResults.round && confirmResults.results && (
        <AlertDialog
          open={confirmResults.open}
          onOpenChange={(open) =>
            setConfirmResults({ ...confirmResults, open })
          }
        >
          <AlertDialogContent className={styles.confirmAlertContent}>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirm Round {confirmResults.round.number} Results
              </AlertDialogTitle>
              <AlertDialogDescription className={styles.confirmDescription}>
                <p>
                  You are about to record the following results. This action will:
                </p>
                <ul className={styles.confirmList}>
                  <li>Close Round {confirmResults.round.number}</li>
                  <li>Eliminate players with incorrect picks</li>
                  <li>Update match results permanently</li>
                </ul>
                <div className={styles.confirmResultsBox}>
                  {confirmResults.results.map((result, idx) => {
                    const match = confirmResults.round!.matches[idx];
                    const winner =
                      result.homeGoals > result.awayGoals
                        ? result.homeTeam
                        : result.homeGoals < result.awayGoals
                          ? result.awayTeam
                          : 'Draw';
                    return (
                      <div
                        key={`${result.homeTeam}-${result.awayTeam}`}
                        className={styles.confirmResultRow}
                      >
                        <span className={styles.matchTeamName}>{result.homeTeam}</span>
                        {' '}
                        <span className={styles.matchTeamsLabel}>
                          {result.homeGoals} - {result.awayGoals}
                        </span>
                        {' '}
                        <span className={styles.matchTeamName}>{result.awayTeam}</span>
                        {winner !== 'Draw' && (
                          <span className={styles.matchTeamsLabel}>
                            ({winner} wins)
                          </span>
                        )}
                        {winner === 'Draw' && (
                          <span className={styles.matchTeamsLabel}>
                            (Draw)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className={styles.confirmWarning}>
                  This action cannot be undone. Are you sure you want to proceed?
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() =>
                  setConfirmResults({ open: false, round: null, results: null })
                }
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmRecordResults}
                className={styles.primaryConfirmButton}
              >
                Confirm & Record Results
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
