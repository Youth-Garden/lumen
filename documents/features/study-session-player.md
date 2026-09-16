# Feature Plan: Interactive Study Session Player & Distractor Fallback Hierarchy

> **Status**: Completed  
> **Author**: Antigravity Pair Programmer  
> **Date**: 2026-09-16  
> **Target Module**: `frontend/apps/web/src/features/study`

---

## 1. Overview & Objectives

Build the multi-mode interactive study session player (Learn New Words, Flashcards, Practice/Review) with an automated quiz generator supporting multiple-choice (`CHOICE_TERM`, `CHOICE_MEANING`), typing (`TYPING`), audio pronunciation playback, keyboard shortcuts, and feedback drawer.

---

## 2. Requirements & Scope

### Functional Requirements
- [x] Multi-exercise queue generation (`FLASHCARD`, `CHOICE_TERM`, `CHOICE_MEANING`, `TYPING`).
- [x] Distractor Cards Fallback Hierarchy for multiple-choice questions (4 distinct options guaranteed):
  1. Priority 1: Same Topic cards.
  2. Priority 2: Same Folder cards.
  3. Priority 3: System-wide Vocabulary DB.
- [x] Audio playback for US and UK accents with auto-play settings.
- [x] Keyboard shortcuts (`Space` to flip, `1` for Mastered, `2` for Known, `3` for Review, `4` for Wrong).
- [x] Feedback drawer integration using `@lumen/uikit/portal` (`usePortalWithoutBackdrop`).

### Non-Functional Requirements
- Custom React hooks MUST stay <= 300 lines of code by extracting state processing algorithms into pure utility functions (`src/features/study/utils/study-session.utils.ts`).

---

## 3. UI/UX Specifications (Frontend)

- **Portal Overlay**: Portal feedback drawer uses single shared backdrop positioning.
- **Z-Index Scale**: Background portals = `98`, Backdrop = `99`, Active portal = `100`.
- **Base UI Triggers**: Triggers use `render={<button ... />}` prop.
- **Shortcuts & Hints**: Keyboard hints formatted cleanly without visual clutter.

---

## 4. Architecture & Technical Contracts

### Frontend (`frontend/apps/web/src/features/study`)
- **Hook**: `useStudySession` in `hooks/use-study-session.ts` (strictly <= 300 lines).
- **Sub-hooks**: `useStudyAudio`, `useStudySettings`, `useStudyShortcuts`.
- **Pure Utilities**: `selectDistractorCards`, `createChoiceTermQuestion`, `createChoiceMeaningQuestion` in `utils/quiz-generator.ts`.
- **Queue Utilities**: `processAdvanceFromFlashcard`, `processFlashcardReviewStep`, `updateCardProgressMap` in `utils/study-session.utils.ts`.

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `frontend/apps/web/src/features/study/hooks/use-study-session.ts` | Refactored queue state management (<= 300 lines) |
| `[MODIFY]` | `frontend/apps/web/src/features/study/utils/quiz-generator.ts` | Distractor fallback hierarchy implementation |
| `[MODIFY]` | `frontend/apps/web/src/features/study/utils/study-session.utils.ts` | Pure utility functions for card progress state |

---

## 6. Implementation & Quality Verification Checklist

- [x] Frontend build check: `cmd.exe /c "pnpm --filter web build"` passes with 0 errors.
- [x] Always generates exactly 4 choices for multiple-choice exercises using real DB words.
- [x] `use-study-session.ts` length strictly <= 300 lines.
- [x] Zero circular coupling between sub-hooks.

---

## 7. Risks & Technical Considerations

- **Small Topic Fallback**: When a topic contains fewer than 4 total words, the fallback hierarchy seamlessly borrows distractors from folder/DB cards without duplicating terms.
