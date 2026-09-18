# Feature Plan: Streak Freeze Protection

> **Status**: In Review
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-18
> **Target Module**: `backend/src/contexts/progress`, `frontend/src/features/settings`, `frontend/src/features/dashboard`

---

## 1. Overview & Objectives

### Purpose
The **Streak Freeze** feature protects a learner's study streak from breaking when they miss a day of study. 

### Core Mechanics
1. **Daily Reward / Accumulation**: Each day a learner completes study activity, they maintain/increment their streak and gain 1 Streak Freeze (capped at a configurable maximum, e.g., 5 freezes).
2. **Automatic Consumption**: When a user misses one or more study days, the system automatically consumes the required number of Streak Freezes to protect the streak rather than resetting it to 0.
3. **Settings & Visibility**: Users can view their current Streak Freeze balance and automatic protection status directly in the Settings page and dashboard metrics.

---

## 2. Requirements & Scope

### Functional Requirements
- [ ] **Backend Schema & Domain Model**:
  - `LearningProfile` aggregate already supports `streakFreezes` and consumes them in `syncStreak()`.
  - Refine `recordActivity()` so that each daily activity maintains streak and awards a streak freeze (capped at maximum limit).
  - Include `streakFreezes: number` in `DashboardResponseDto` and `GetDashboardHandler`.
- [ ] **Frontend Integration**:
  - Update `ProgressDashboardData` type to include `streakFreezes: number`.
  - Add a dedicated **Streak Freeze** card / section in `SettingsPage` (`apps/web/src/features/settings/pages/settings-page.tsx`) showing:
    - Current number of active Streak Freezes (with ice/snowflake visual badge).
    - Status: "Tự động kích hoạt khi bạn bỏ lỡ ngày học" (Auto-protects streak on missed days).
  - Centralize all strings in `messages/vi.json` and `messages/en.json`.

### Non-Functional Requirements
- **Performance**: Zero-latency overhead; `streakFreezes` is already a column in `learning_profiles`.
- **Type Safety**: Full strict TypeScript types, zero `any`.
- **UI/UX Consistency**: Matches Lumen design system with clean flat card surface, no nested box clutter.

---

## 3. UI/UX Specifications (Frontend)

- **Surface**: Standard `<Card>` with `CardHeader` and `CardContent` matching existing sections in Settings.
- **Visual Badge**: Ice / Snowflake icon with cyan/blue accent pill displaying `X lượt đóng băng khả dụng`.
- **Descriptions**: Explain that streak freeze is earned daily and automatically used when missing a day.

---

## 4. Implementation Steps

1. **Backend**:
   - Update `DashboardResponseDto` to expose `streakFreezes`.
   - Update `GetDashboardHandler` to pass `profile.streakFreezes`.
   - Ensure `recordActivity` logic awards 1 freeze per daily streak progression up to a cap (e.g. 5).
2. **Frontend**:
   - Update `progress.types.ts` with `streakFreezes`.
   - Create `StreakFreezeCard` or section in `settings-page.tsx`.
   - Add i18n keys in `vi.json` and `en.json`.
3. **Verification**:
   - Run `tsc --noEmit` and `eslint` on both backend and frontend.
