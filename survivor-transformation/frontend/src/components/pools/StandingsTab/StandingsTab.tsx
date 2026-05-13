import { useState, useMemo } from 'react';
import {
  getGroupDefinitions,
  computeGroupStandingsFromRounds,
  hasAnyPlayedGroupMatch,
} from '~/data/standings';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { usePoolPage } from '~/contexts/PoolPageContext';
import { TeamFlag } from '~/components/TeamFlag/TeamFlag';
import { euro2024Standings } from '~/data/euro2024';
import { worldCup2026Standings } from '~/data/worldcup2026';
import type { StandingRow } from '~/data/standings.types';
import type { TournamentConfig } from '~/config/tournaments/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/Table/Table';
import { Card, CardContent } from '~/components/Card/Card';
import { cn } from '~/lib/utils';
import styles from './StandingsTab.module.less';

function FormChips({ form }: { form: string[] }) {
  return (
    <div className={styles.formChips}>
      {form.map((f, i) => (
        <span
          key={i}
          className={cn(
            styles.formChip,
            f === 'W' && styles.formChipWin,
            f === 'D' && styles.formChipDraw,
            f === 'L' && styles.formChipLoss
          )}
        >
          {f}
        </span>
      ))}
    </div>
  );
}

function SortableHeader({
  column,
  children,
  className,
}: {
  column: {
    getIsSorted: () => false | 'asc' | 'desc';
    getToggleSortingHandler: () => ((event: unknown) => void) | undefined;
  };
  children: React.ReactNode;
  className?: string;
}) {
  const sortDir = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(styles.sortableHeader, sortDir && styles.sortableHeaderActive, className)}
    >
      {children}
      {sortDir === 'asc' && <ArrowUp className={styles.sortIcon} />}
      {sortDir === 'desc' && <ArrowDown className={styles.sortIcon} />}
      {!sortDir && <ArrowUpDown className={styles.sortIcon} />}
    </button>
  );
}

function createStandingsColumns(tournamentConfig: TournamentConfig | null): ColumnDef<StandingRow>[] {
  return [
    {
      accessorKey: 'rank',
      header: ({ column }) => (
        <SortableHeader column={column} className={styles.headerJustifyCenter}>
          #
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <span className={styles.rankText}>{row.original.rank}</span>
      ),
      size: 32,
    },
    {
      accessorKey: 'team',
      header: () => <span className={styles.staticHeaderLabel}>Team</span>,
      cell: ({ row }) => (
        <div className={styles.teamCell}>
          <TeamFlag
            teamName={row.original.team}
            tournamentConfig={tournamentConfig}
            height={20}
          />
          <span className={styles.teamName}>{row.original.team}</span>
        </div>
      ),
    },
    {
      accessorKey: 'mp',
      header: ({ column }) => (
        <SortableHeader column={column} className={styles.headerJustifyCenter}>
          MP
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <span className={styles.numeric}>{row.original.mp}</span>
      ),
      size: 40,
    },
    {
      accessorKey: 'w',
      header: ({ column }) => (
        <SortableHeader column={column} className={styles.headerJustifyCenter}>
          W
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <span className={styles.numeric}>{row.original.w}</span>
      ),
      size: 40,
    },
    {
      accessorKey: 'd',
      header: ({ column }) => (
        <SortableHeader column={column} className={styles.headerJustifyCenter}>
          D
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <span className={styles.numeric}>{row.original.d}</span>
      ),
      size: 40,
    },
    {
      accessorKey: 'l',
      header: ({ column }) => (
        <SortableHeader column={column} className={styles.headerJustifyCenter}>
          L
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <span className={styles.numeric}>{row.original.l}</span>
      ),
      size: 40,
    },
    {
      id: 'gfga',
      header: () => (
        <span className={styles.staticHeaderLabel} title="Goals for : Goals against">
          GF:GA
        </span>
      ),
      cell: ({ row }) => (
        <span className={styles.gfga}>{row.original.gf}:{row.original.ga}</span>
      ),
      size: 56,
    },
    {
      accessorKey: 'gd',
      header: ({ column }) => (
        <SortableHeader column={column} className={styles.headerJustifyCenter}>
          GD
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const gd = row.original.gd;
        return (
          <span
            className={cn(
              styles.numeric,
              gd > 0 && styles.gdPositive,
              gd < 0 && styles.gdNegative,
              gd === 0 && styles.gdNeutral
            )}
          >
            {gd >= 0 ? '+' : ''}
            {gd}
          </span>
        );
      },
      size: 40,
    },
    {
      accessorKey: 'pts',
      header: ({ column }) => (
        <SortableHeader column={column} className={styles.headerJustifyCenter}>
          PTS
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <span className={styles.ptsValue}>{row.original.pts}</span>
      ),
      size: 40,
    },
    {
      accessorKey: 'form',
      header: () => <span className={styles.staticHeaderLabel}>FORM</span>,
      cell: ({ row }) => <FormChips form={row.original.form} />,
      enableSorting: false,
      size: 96,
    },
  ];
}

interface GroupStandingsTableProps {
  group: string;
  teams: StandingRow[];
  tournamentConfig: TournamentConfig | null;
}

function GroupStandingsTable({ group, teams, tournamentConfig }: GroupStandingsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'pts', desc: true }]);

  const columns = useMemo(
    () => createStandingsColumns(tournamentConfig),
    [tournamentConfig]
  );

  const table = useReactTable({
    data: teams,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section className={styles.groupSection}>
      <h3 className={styles.groupTitle}>
        GROUP {group}
      </h3>
      <div className={styles.tableWrapper}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={styles.headerRow}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      styles.headerCell,
                      header.column.getCanSort() && styles.headerCellSortable
                    )}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={styles.row}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      styles.cell,
                      cell.column.id === 'rank' && styles.cellCenter,
                      ['mp', 'w', 'd', 'l', 'gd', 'pts'].includes(cell.column.id) && styles.cellCenter,
                      cell.column.id === 'gfga' && styles.cellCenter
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export function StandingsTab() {
  const { tournamentConfig, poolInfo, rounds } = usePoolPage();

  const tournamentKey = poolInfo?.tournamentKey;

  const staticStandings = useMemo(() => {
    if (tournamentKey === 'euro-2024') return euro2024Standings;
    if (tournamentKey === 'world-cup-2026') return worldCup2026Standings;
    return [];
  }, [tournamentKey]);

  const groupDefinitions = useMemo(
    () => getGroupDefinitions(tournamentKey),
    [tournamentKey],
  );

  const useLiveStandings = useMemo(() => {
    if (!tournamentKey) return false;
    return hasAnyPlayedGroupMatch(rounds, tournamentKey);
  }, [tournamentKey, rounds]);

  const standings = useMemo(() => {
    if (!tournamentKey || !groupDefinitions) return [];
    if (useLiveStandings) {
      return computeGroupStandingsFromRounds(
        rounds,
        tournamentKey,
        groupDefinitions,
      );
    }
    return staticStandings;
  }, [
    tournamentKey,
    groupDefinitions,
    rounds,
    useLiveStandings,
    staticStandings,
  ]);

  if (staticStandings.length === 0) {
    return (
      <Card>
        <CardContent className={styles.emptyCard}>
          Standings are available for EURO 2024 and World Cup 2026 pools. This pool has no standings
          data.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={styles.root}>
      <p className={styles.description}>
        {useLiveStandings
          ? 'Tables reflect recorded results from group-stage rounds (same data as Results).'
          : 'Preview from tournament template. Tables will update when group-stage results are recorded.'}
      </p>
      {standings.map((group) => (
        <GroupStandingsTable
          key={group.group}
          group={group.group}
          teams={group.teams}
          tournamentConfig={tournamentConfig}
        />
      ))}
    </div>
  );
}
