# Feature Plan: Automatic Streak Freeze Consumption & Weekly Goal Tracker Streak Icon Fix

> **Status**: Approved
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-24
> **Target Module**: `backend/src/contexts/progress/domain/aggregates/learning-profile.aggregate.ts`, `frontend/apps/web/src/features/dashboard/components/weekly-goal-tracker-card.tsx`

---

## 1. Overview & Objectives

This feature enforces automatic **Streak Freeze** protection in backend domain logic and updates the frontend **Weekly Goal Tracker** card to display 3D `<StreakIcon>` on completed study days instead of generic checkmark icons.

### Key Objectives:
1. **Automatic Backend Streak Protection (`LearningProfile.syncStreak`)**:
   - Automatically consume available streak freezes when a user misses study days (`daysDiff > 1`).
   - Preserve current streak count and update `lastActivityDate` to yesterday (`today - 1 day`).
   - Replenish/grant 1 streak freeze upon first activity or streak recovery up to max capacity.
2. **Weekly Goal Tracker UI Enhancement (`WeeklyGoalTrackerCard`)**:
   - Replace generic green checkmark circles on completed study days with 3D `<StreakIcon size={22} />`.
   - Preserve 3D `<StreakFreezeIcon size={22} />` for frozen days.
   - Eliminate background boxes/wrappers around icons in compliance with Lumen's Strict UI Rules.

---

## 2. Requirements & Scope

### Functional Requirements
- [x] **Backend Domain Protection (`LearningProfile.aggregate.ts`)**:
  - `syncStreak(now, hasActivityToday)`: Deducts `missedDays` from `_streakFreezes` when `_streakFreezes >= missedDays`, preventing streak reset.
  - Advance `lastActivityDate` to `today - 1 day` when streak freeze is consumed.
  - Reset streak to 0 ONLY if `_streakFreezes < missedDays`.
- [x] **Weekly Goal Tracker UI (`weekly-goal-tracker-card.tsx`)**:
  - Replace `<Icons name="check" />` inside green circle on `isCompleted` with standalone `<StreakIcon size={22} />`.
  - Maintain `<StreakFreezeIcon size={22} />` on `isFrozen`.
  - Display progress ring percent on active today, `!` on missed days, and subtle dot on upcoming days.

### Non-Functional Requirements
- **Clean Architecture**: Domain logic managed inside `LearningProfile` aggregate. UI presentation handled cleanly inside `WeeklyGoalTrackerCard`.
- **Type Safety**: 0 `any` types.
- **Strict UI Rules**: Zero background circle wrappers around standalone 3D icons.

---

## 3. UI/UX Specifications (Frontend)

```
Completed Day: [ 3D StreakIcon (size 22) ]
Frozen Day:    [ 3D StreakFreezeIcon (size 22) ]
Missed Day:    [ "!" badge (rose) ]
Active Today:  [ Progress Ring with % ]
```

---

## 4. Architecture & Technical Contracts

### Backend Domain Aggregate (`LearningProfile`)

```ts
if (diffDays > 1) {
  const missedDays = diffDays - 1;
  if (this._streakFreezes >= missedDays) {
    this._streakFreezes -= missedDays;
    const protectedDate = new Date(today);
    protectedDate.setDate(protectedDate.getDate() - 1);
    this.lastActivityDate = protectedDate;
  } else {
    this.streak = 0;
    this._streakFreezes = 0;
  }
}
```

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `backend/src/contexts/progress/domain/aggregates/learning-profile.aggregate.ts` | Verify automatic streak freeze deduction and date advancement |
| `[MODIFY]` | `frontend/apps/web/src/features/dashboard/components/weekly-goal-tracker-card.tsx` | Render 3D StreakIcon on completed days instead of check circle |

---

## 6. Implementation & Quality Verification Checklist

- [x] Frontend typecheck passes with 0 errors (`cmd /c npx tsc --noEmit` in `frontend/apps/web`).
- [x] Backend typecheck passes with 0 errors (`cmd /c npx tsc --noEmit` in `backend`).
- [x] Completed days in Weekly Goal Tracker render 3D `<StreakIcon size={22} />`.
- [x] Frozen days in Weekly Goal Tracker render 3D `<StreakFreezeIcon size={22} />`.
