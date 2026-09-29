# Feature Investigation: Streak Freeze & Streak Loss Root Cause Analysis

> **Status**: Completed
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-27
> **Target Module**: `backend/src/contexts/progress/domain/aggregates/learning-profile.aggregate.ts`

---

## 1. Overview & Objectives

Investigate the user's reported issue where their study streak was reset to `0` upon logging in on Sunday, despite having an active Streak Freeze shield.

---

## 2. Empirical Database Query Evidence

Direct SQL inspection performed on the production PostgreSQL database (`learning_profiles` & `activities` tables):

### `learning_profiles` Table Record
```json
{
  "id": "f6270938-e06f-46bd-940f-50b0b42a118f",
  "userId": "0866bcef-55a1-42df-aa14-32fcbf45d6cb",
  "streak": 0,
  "streakFreezes": 0,
  "lastActivityDate": "2026-09-24T02:27:29.011Z",
  "updated_at": "2026-09-27T00:09:14.348Z"
}
```

### `activities` Table Record
- The last recorded activity for this user ID was logged on **Thursday, Sept 24, 2026 at 02:27 AM UTC** (`2026-09-24T02:27:29.011Z`).
- **Zero activities** were recorded in the database on **Friday, Sept 25** or **Saturday, Sept 26**.

---

## 3. Mathematical & System Execution Flow Analysis

1. **Activity Timeline**:
   - Last Activity: Thursday, Sept 24.
   - Missed Day 1: Friday, Sept 25 (0 activities logged).
   - Missed Day 2: Saturday, Sept 26 (0 activities logged).
   - Current Login: Sunday, Sept 27 (`2026-09-27T00:09:14.348Z`).

2. **`syncStreak` Calculation**:
   - `diffDays` = `Sunday (Sept 27) - Thursday (Sept 24)` = **3 days**.
   - `missedDays` = `diffDays - 1` = **2 missed days** (Friday & Saturday).

3. **Streak Freeze Consumption Logic**:
   - `1 Streak Freeze` protects exactly **1 missed day**.
   - To preserve the streak over a 2-day gap, the user requires `streakFreezes >= 2`.
   - Since the user's profile had `streakFreezes < 2` (0 or 1 freeze), `syncStreak` executed the streak reset branch in `learning-profile.aggregate.ts`:
     ```typescript
     if (this._streakFreezes >= missedDays) {
       this._streakFreezes -= missedDays;
       // Streak preserved
     } else {
       this.streak = 0;
       this._streakFreezes = 0;
     }
     ```
   - On Sunday at 00:09 AM, `GetDashboardHandler` executed `syncStreak` and persisted `streak = 0` to PostgreSQL.

---

## 4. Conclusion & Recovery Mechanism

- The streak reset to `0` because **2 consecutive days (Friday & Saturday)** were missed, requiring 2 Streak Freezes, whereas the user had fewer than 2 freezes.
- Completing a single study activity today (Sunday) triggers `recordActivity()`, which will immediately reactivate a **1-day streak** and grant **1 new Streak Freeze shield**.
