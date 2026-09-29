# Feature Plan: Historical Daily Goal Tracking & Period-based Target Resolution

> **Status**: Completed
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-27
> **Target Module**: `backend/src/contexts/progress/` & `frontend/apps/web/src/features/dashboard/`

---

## 1. Overview & Objectives

Solve the historical goal recalculation flaw where updating the daily study goal (e.g., from 15 minutes to 30 minutes) retroactively changes past goal targets across historical heatmaps, weekly trackers, and trend charts.

### Business & User Value
- **Historical Accuracy**: Users who met their 15-minute goal in previous weeks/months will retain their earned completions (`isGoalMet = true`) even after increasing their goal to 30 minutes today.
- **Period-based Goal Progression**: Enables adaptive goal tracking where targets evolve over time (e.g., Early August = 15m, Late August = 30m) without corrupting past performance analytics.

---

## 2. Requirements & Scope

### Functional Requirements
- **Goal History Persistence**: Track historical goal changes with effective date intervals (`effectiveFrom`, `effectiveTo`).
- **Date-Specific Goal Resolution**: When evaluating `isGoalMet` or rendering historical trend lines for date `D`:
  - Find the goal target active on date `D`.
  - Fallback to current `dailyGoalMinutes` if no historical record exists prior to date `D`.
- **Settings Update Command**: Updating daily goal settings (`UpdateProgressSettingsCommand`) creates a new goal history entry and closes the preceding entry.
- **Dashboard & Analytics APIs**:
  - `GetDashboardQuery`: Returns historical daily goal targets mapped by date or date ranges for weekly trackers and trend charts.
  - `computeWeeklyTrackerDays` (Frontend): Resolves the active goal for each day in the 7-day capsule grid.

### Non-Functional Requirements
- **Type Safety**: Full TypeScript interfaces, 0 `any` types.
- **Performance**: Indexed queries on `(userId, effectiveFrom)`.
- **DDD & Clean Architecture**: Domain entity `DailyGoalHistory`, repository methods, and clean event/command handlers.

---

## 3. Architecture & Technical Contracts

### Database Schema (`daily_goal_histories`)

```sql
CREATE TABLE daily_goal_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_minutes INT NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to TIMESTAMPTZ NULL, -- NULL indicates currently active
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_goal_histories_user_effective 
  ON daily_goal_histories(user_id, effective_from);
```

### Domain Logic & Goal Resolution
- Utility method: `resolveTargetForDate(date: Date, histories: DailyGoalHistory[], fallbackGoal: number): number`
  - Returns `history.targetMinutes` where `history.effectiveFrom <= date AND (history.effectiveTo IS NULL OR history.effectiveTo > date)`.
  - If no matching history, returns `fallbackGoal`.

---

## 4. UI/UX Specifications (Frontend)

- **Weekly Goal Tracker**: Evaluates `isGoalMet` for each day `D` against `resolveTargetForDate(D)`.
- **Study Trends Chart**: Renders target threshold line based on the active goal for the selected date range (or date-specific targets).
- **i18n Compatibility**: Messages stay clean with localized parameters.

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[NEW]` | `backend/src/contexts/progress/infrastructure/entities/daily-goal-history.entity.ts` | TypeORM Entity for goal history |
| `[NEW]` | `backend/src/contexts/progress/domain/aggregates/daily-goal-history.aggregate.ts` | Domain aggregate for goal history |
| `[MODIFY]` | `backend/src/contexts/progress/application/commands/update-progress-settings.handler.ts` | Persist goal history entry on goal update |
| `[MODIFY]` | `backend/src/contexts/progress/application/queries/get-dashboard.handler.ts` | Include historical goal targets in dashboard response |
| `[MODIFY]` | `frontend/apps/web/src/features/dashboard/utils/streak-tracker.utils.ts` | Resolve target per date in weekly tracker |
| `[MODIFY]` | `frontend/apps/web/src/features/dashboard/components/weekly-study-chart.tsx` | Display period-based target line |

---

## 6. Implementation & Quality Verification Checklist

- [x] Migration / Entity creation for `daily_goal_histories`.
- [x] `UpdateProgressSettingsHandler` writes historical effective dates.
- [x] `GetDashboardHandler` returns date-specific goal targets.
- [x] Past dates evaluate `isGoalMet` using their historical active target.
- [x] `tsc --noEmit` passes with 0 errors on backend & frontend.

---

## 7. Risks & Technical Considerations

- Initial migration must create a baseline `daily_goal_history` record for existing users using their current `dailyGoalMinutes` with `effectiveFrom = user.createdAt`.
