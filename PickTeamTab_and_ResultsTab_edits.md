# PickTeamTab + ResultsTab round label fix (World Cup 2026)

## Root cause
- `PickTeamTab` gets stage labels from `getPickTeamStageLabel` in `survivor-transformation/frontend/src/locales/labels/pool.labels.ts`, where round mapping is hardcoded only for rounds `1..5`.
- `ResultsTab` has its own local `getStageLabel` in `survivor-transformation/frontend/src/components/pools/ResultsTab/ResultsTab.tsx`, also hardcoded for `1..5`.
- `world-cup-2026.config.ts` already defines the correct labels for all `8` rounds, but these two UI paths do not consistently read from config.

## To-do tasks
- [x] Update `PickTeamTab` label source:
  - Replace hardcoded `ROUND_STAGE_KEYS` logic (or make it fallback only).
  - Use tournament config round label (via `getRoundStageLabel` / predefined round lookup) when available.
  - Keep i18n fallback for tournaments without predefined round labels.

- [x] Update `ResultsTab` label source:
  - Remove/replace local hardcoded `getStageLabel`.
  - Read stage label from tournament config for each `round.roundNumber`.
  - Fallback to `Round ${roundNumber}` only when config label is missing.

- [x] Ensure World Cup 2026 expected labels render:
  - Round 1 -> Group Stage (Matchday 1)
  - Round 2 -> Group Stage (Matchday 2)
  - Round 3 -> Group Stage (Matchday 3)
  - Round 4 -> Round of 32
  - Round 5 -> Round of 16
  - Round 6 -> Quarter-finals
  - Round 7 -> Semi-finals
  - Round 8 -> Final

- [ ] Verify in UI:
  - `Pick team` tab heading uses correct stage per round.
  - `Results` tab section title uses the same correct stage per round.
  - Check both EN and BG locale behavior after fallback changes.

- [x] Optional cleanup (recommended):
  - Consolidate round label logic into one shared helper to avoid future drift between `PickTeamTab`, `ResultsTab`, and profile/stats helpers.

## Short report
- Implemented config-first round stage labels in both tabs so World Cup 2026 now respects all 8 configured rounds.
- `PickTeamTab`: updated label resolution to use `getRoundStageLabel(tournamentKey, roundNumber)` first, with previous i18n mapping kept as fallback.
- `ResultsTab`: removed local hardcoded 5-round mapping and switched to tournament-config labels with `Round N` fallback when missing.
- Hooked `PickTeamTab` to pass `poolInfo?.tournamentKey` into the label resolver.
- Checked linting for edited files; no issues found.
- UI verification is still pending manual check in browser.
