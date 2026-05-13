import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/Tabs/Tabs";
import { LayoutDashboard, Users, ListOrdered } from "lucide-react";
import { PoolOverview } from "~/components/pools/PoolOverview/PoolOverview";
import { ParticipantsTab } from "~/components/pools/ParticipantsTab/ParticipantsTab";
import { RoundsTab } from "~/components/pools/RoundsTab/RoundsTab";
import type { Pool } from "~/types/pool";
import styles from "./PoolManagementTabs.module.less";

type PoolManagementTabsProps = {
  pool: Pool;
  isReadOnly: boolean;
  activeTab: string;
  pendingFilterRequested: boolean;
  onTabChange: (tab: string) => void;
  onPendingFilterReset: () => void;
  onGoToParticipantsWithPendingFilter: () => void;
  onStatusChange: (newStatus: Pool["status"]) => void;
};

export function PoolManagementTabs({
  pool,
  isReadOnly,
  activeTab,
  pendingFilterRequested,
  onTabChange,
  onPendingFilterReset,
  onGoToParticipantsWithPendingFilter,
  onStatusChange,
}: PoolManagementTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => {
        onTabChange(v);
        if (v !== "participants") {
          onPendingFilterReset();
        }
      }}
      className={styles.tabsRoot}
    >
      <TabsList className={styles.tabsList}>
        <TabsTrigger value="overview" className={styles.tabsTrigger}>
          <LayoutDashboard className={styles.tabIcon} />
          Overview
        </TabsTrigger>
        <TabsTrigger value="participants" className={styles.tabsTrigger}>
          <Users className={styles.tabIcon} />
          Participants
        </TabsTrigger>
        <TabsTrigger value="rounds" className={styles.tabsTrigger}>
          <ListOrdered className={styles.tabIcon} />
          Rounds &amp; Results
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <PoolOverview
          pool={pool}
          onStatusChange={onStatusChange}
          pendingCount={pool.pendingCount ?? 0}
          eliminatedCount={pool.eliminatedCount ?? 0}
          onGoToParticipants={onGoToParticipantsWithPendingFilter}
        />
      </TabsContent>

      <TabsContent value="participants">
        <ParticipantsTab
          poolId={pool.id}
          isReadOnly={isReadOnly}
          initialParticipantFilter={
            activeTab === "participants" && pendingFilterRequested
              ? "pending"
              : undefined
          }
        />
      </TabsContent>

      <TabsContent value="rounds">
        <RoundsTab
          poolId={pool.id}
          isReadOnly={isReadOnly}
          tournamentKey={pool.tournamentKey}
        />
      </TabsContent>
    </Tabs>
  );
}

