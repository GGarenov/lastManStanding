import { Card, CardContent } from "~/components/Card/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/Select/Select";
import styles from "./LeaderboardPoolSelector.module.less";

type PoolOption = {
  id: string;
  name: string;
  myStatus: string;
  status: string;
};

type LeaderboardPoolSelectorProps = {
  poolId: string | null;
  pools: PoolOption[];
  onPoolChange: (poolId: string) => void;
};

export function LeaderboardPoolSelector({
  poolId,
  pools,
  onPoolChange,
}: LeaderboardPoolSelectorProps) {
  return (
    <Card className={styles.selectorCard}>
      <CardContent className={styles.selectorContent}>
        <div className={styles.selectorRow}>
          <label htmlFor="pool-select" className={styles.selectorLabel}>
            Select Pool:
          </label>
          <Select value={poolId || ""} onValueChange={onPoolChange}>
            <SelectTrigger id="pool-select" className={styles.selectTrigger}>
              <SelectValue placeholder="Select a pool" />
            </SelectTrigger>
            <SelectContent>
              {pools
                .filter(
                  (p) => p.myStatus === "approved" || p.myStatus === "winner"
                )
                .map((pool) => (
                  <SelectItem key={pool.id} value={pool.id}>
                    {pool.name}
                    {pool.myStatus === "winner"
                      ? " (Winner)"
                      : pool.status === "finished"
                        ? " (Finished)"
                        : ""}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
