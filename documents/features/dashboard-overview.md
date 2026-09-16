# Feature Plan: Dashboard Overview, Activity Heatmap & Metrics

> **Status**: Completed  
> **Author**: Antigravity Pair Programmer  
> **Date**: 2026-09-16  
> **Target Module**: `frontend/apps/web/src/features/dashboard`

---

## 1. Overview & Objectives

Provide learners with a comprehensive, bento-grid Dashboard Overview displaying study metrics KPIs, 365-day Activity Heatmap Calendar, Memory Retention Stage breakdown, weekly study time chart, and daily goal setting modal.

---

## 2. Requirements & Scope

### Functional Requirements
- [x] Core KPIs: Streak days, Today's study time, Daily goal target, Total learned words, Due flashcards count.
- [x] 365-Day Activity Heatmap Calendar with auto-scroll to current date and tooltip breakdown.
- [x] Memory Retention Breakdown across 5 SRS stage levels.
- [x] Daily Goal setting modal via `@lumen/uikit/portal`.

### Non-Functional Requirements
- Components MUST stay <= 300 lines of code by extracting UI sub-components (`HeatmapLegend`, `HeatmapInsightsSidebar`).
- Counter metrics sourced directly from `GET /vocabulary/overview` (`dueCount`) to eliminate redundant HTTP requests.

---

## 3. UI/UX Specifications (Frontend)

- **Layout**: Asymmetric Bento Row (8 cols vs 4 cols) + Full-Width Bento Card for Heatmap.
- **Color Intensity**: HSL Indigo gradient intensity scale (Level 0 through 5).
- **Anti-Box-in-Box**: Clean surface card backgrounds without nested inner boxes.
- **Base UI Triggers**: Heatmap cell tooltips use `TooltipTrigger render={<div ... />}`.

---

## 4. Architecture & Technical Contracts

### Frontend (`frontend/apps/web/src/features/dashboard`)
- **Page Component**: `OverviewPage` (`pages/overview-page.tsx`).
- **Components**: `HeatmapCalendar` (`components/heatmap-calendar.tsx`), `StudyMetricsCards`, `MemoryRetentionCard`, `WeeklyStudyChart`.
- **Query Hooks**: `useVocabularyOverview`, `useProgressDashboard`, `useHeatmap`.

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `frontend/apps/web/src/features/dashboard/pages/overview-page.tsx` | Use `dueCount` from overview hook |
| `[MODIFY]` | `frontend/apps/web/src/features/dashboard/components/heatmap-calendar.tsx` | Refactored into modular sub-components (<= 300 lines) |

---

## 6. Implementation & Quality Verification Checklist

- [x] Frontend build check: `cmd.exe /c "pnpm --filter web build"` passes with 0 errors.
- [x] `heatmap-calendar.tsx` line count strictly <= 300 lines.
- [x] Base UI triggers use `render` prop.
- [x] No hardcoded text or emojis used as icons.

---

## 7. Risks & Technical Considerations

- **Horizontal Scroll on Mobile**: Heatmap container uses `overflow-x-auto` with smooth scrolling to ensure zero horizontal layout overflow on mobile screens.
