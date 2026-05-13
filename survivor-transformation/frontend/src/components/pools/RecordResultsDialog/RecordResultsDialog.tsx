import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/Dialog/Dialog";
import { Button } from "~/components/Button/Button";
import { Input } from "~/components/Input/Input";
import { Round } from "~/types/pool";
import type { MatchResultPayload } from "~/api/admin.api";
import styles from "./RecordResultsDialog.module.less";

interface RecordResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  round: Round;
  onSubmit: (results: MatchResultPayload[]) => void;
}

interface ScoreInput {
  homeGoals: number;
  awayGoals: number;
}

export function RecordResultsDialog({
  open,
  onOpenChange,
  round,
  onSubmit,
}: RecordResultsDialogProps) {
  const [scores, setScores] = useState<Record<string, ScoreInput>>({});

  useEffect(() => {
    if (open && round.matches.length > 0) {
      setScores(
        round.matches.reduce(
          (acc, match) => ({
            ...acc,
            [match.id]: {
              homeGoals: match.homeGoals ?? 0,
              awayGoals: match.awayGoals ?? 0,
            },
          }),
          {} as Record<string, ScoreInput>
        )
      );
    }
  }, [open, round.id, round.matches]);

  const handleScoreChange = (
    matchId: string,
    field: "homeGoals" | "awayGoals",
    value: string
  ) => {
    const num = parseInt(value, 10);
    const safe = Number.isNaN(num) || num < 0 ? 0 : num;
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: safe,
      },
    }));
  };

  const buildResultsArray = (): MatchResultPayload[] => {
    return round.matches.map((match) => ({
      homeTeam: match.teamA,
      awayTeam: match.teamB,
      homeGoals: Number(scores[match.id]?.homeGoals ?? 0),
      awayGoals: Number(scores[match.id]?.awayGoals ?? 0),
    }));
  };

  const handleSubmit = () => {
    onSubmit(buildResultsArray());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.content}>
        <DialogHeader className={styles.header}>
          <DialogTitle className={styles.title}>
            Round {round.number} – Enter scores
          </DialogTitle>
        </DialogHeader>

        <div className={styles.list}>
          {round.matches.map((match) => (
            <div key={match.id} className={styles.row}>
              <span className={styles.teamName} title={match.teamA}>
                {match.teamA}
              </span>
              <Input
                type="number"
                min={0}
                value={scores[match.id]?.homeGoals ?? ""}
                onChange={(e) =>
                  handleScoreChange(match.id, "homeGoals", e.target.value)
                }
                className={styles.scoreInput}
              />
              <span className={styles.dash}>–</span>
              <Input
                type="number"
                min={0}
                value={scores[match.id]?.awayGoals ?? ""}
                onChange={(e) =>
                  handleScoreChange(match.id, "awayGoals", e.target.value)
                }
                className={styles.scoreInput}
              />
              <span className={styles.teamNameRight} title={match.teamB}>
                {match.teamB}
              </span>
            </div>
          ))}
        </div>

        <DialogFooter className={styles.footer}>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
