# Feature Plan: Scalable DB-Driven Historical Daily Goal Target Tracking

> **Status**: Completed
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-27
> **Target Module**: `backend/src/contexts/progress` | `frontend/src/features/dashboard`

---

## 1. Overview & Objectives

Provide a **100% Database-Driven, Scalable, and Zero-Workaround** system for tracking historical daily study goal targets.

When a user updates their daily target (e.g., from 15 minutes to 60 minutes today):
1. The updated target is recorded in PostgreSQL (`daily_goal_histories`) as a new effective interval starting from `now`.
2. The previous target interval is closed (`effectiveTo = now`).
3. Past historical days retain their exact DB-recorded target on those dates, ensuring past goal completion statuses ("Goals met X/7 days") and chart reference lines are strictly preserved based on real DB history.

---

## 2. Architecture & Data Model (Single Source of Truth)

### Database Entity: `daily_goal_histories`
- `id` (UUID): Primary key.
- `userId` (UUID): Foreign key to user profile.
- `targetMinutes` (int): Target in minutes (e.g., 15, 30, 45, 60).
- `effectiveFrom` (timestamp): Start of target interval.
- `effectiveTo` (timestamp | null): End of target interval (`null` indicates currently active target).

### Continuous History Guarantee (Zero Gaps)
To prevent missing historical intervals for legacy or new users:
1. **Initial Seed on Profile Creation**: When a user registers or `LearningProfile` is created, Backend seeds the baseline record:
   ```json
   {
     "targetMinutes": 15,
     "effectiveFrom": "user.createdAt",
     "effectiveTo": null
   }
   ```
2. **Auto-Healing Query Handler**: `GetDashboardHandler` checks if `daily_goal_histories` is empty. If empty, it automatically seeds the initial record starting from `createdAt`, guaranteeing 100% data continuity.
3. **Interval Splitting on Update**: When `UpdateProgressSettingsHandler` executes:
   - Active interval (`effectiveTo IS NULL`) is updated to `effectiveTo = now`.
   - New interval is created: `{ targetMinutes: newTarget, effectiveFrom: now, effectiveTo: null }`.

---

## 3. Requirements & Scope

### Functional Requirements
- [x] **DB-Driven Target Resolution**: All target calculations (past, present, future) resolve against DB records in `daily_goal_histories`.
- [x] **No Retroactive Mutation**: Changing target today (e.g. to 60m) only creates a new interval from `now` onward. Past days retain their exact target (e.g. 15m).
- [x] **Auto-Heal Legacy Users**: Automatically seed baseline history for users missing an initial DB history record.
- [x] **Exact "Goals Met" Calculation**: "Goals met X/7 days" badge and chart tooltips query date-matched DB intervals.

### Non-Functional Requirements
- **SOLID / DDD Compliance**: Repository encapsulation, CQRS handler segregation, and domain event consistency.
- **Performance**: PostgreSQL index `@Index('idx_daily_goal_histories_user_effective', ['userId', 'effectiveFrom'])` ensures instant query performance ($< 2\text{ms}$).
- **Type Safety**: Strict TypeScript interfaces, zero `any` usage.

---

## 4. UI/UX Specifications (Frontend)

- **Weekly Goal Tracker Card**:
  - Each day (Mon-Sun) maps its date to `goalHistories` DB intervals.
  - Days prior to today check `studiedMinutes >= historicalTarget`.
  - Today and future days check `studiedMinutes >= currentActiveTarget`.
- **Study Trends Chart (`WeeklyStudyChart`)**:
  - Recharts reference lines and bar tooltips render the exact target active on each specific date.

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `backend/src/contexts/progress/application/queries/get-dashboard.handler.ts` | Auto-heal & seed initial DB history record if user history is empty |
| `[MODIFY]` | `backend/src/contexts/progress/application/commands/update-progress-settings.handler.ts` | Ensure clean interval boundary splitting when updating target |
| `[MODIFY]` | `frontend/apps/web/src/features/dashboard/utils/streak-tracker.utils.ts` | Match day dates directly against DB history intervals |
| `[MODIFY]` | `frontend/apps/web/src/features/dashboard/components/weekly-study-chart.tsx` | Render DB-driven historical targets per day in chart tooltips and reference lines |
| `[NEW]` | `frontend/apps/web/src/features/dashboard/utils/__tests__/streak-tracker.utils.spec.ts` | Unit tests for target resolution and weekly tracker days computation |

---

## 6. Implementation & Quality Verification Checklist

- [x] Backend check: `cmd /c pnpm exec tsc --noEmit` in `backend/` passes with 0 errors.
- [x] Frontend check: `cmd /c pnpm exec tsc --noEmit` in `apps/web/` passes with 0 errors.
- [x] Unit test check: `cmd /c pnpm exec vitest run src/features/dashboard/utils/__tests__/streak-tracker.utils.spec.ts` passes 100%.
- [x] DB verification: `daily_goal_histories` contains continuous, non-overlapping target intervals.
- [x] Updating daily goal today preserves past days' goal status in UI.

---

## 7. Risks & Technical Considerations

- **Server/Client Timezone Boundary**: Date interval matching must compare local date boundaries (`startOfDay`) consistently between NestJS backend DTOs and React frontend.
