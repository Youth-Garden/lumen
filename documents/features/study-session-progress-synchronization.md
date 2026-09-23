# Feature Plan: Study Session Progress Synchronization & Accurate Target Points

> **Status**: Completed  
> **Author**: Antigravity Pair Programmer / BA  
> **Date**: 2026-09-22  
> **Target Module**: frontend/src/features/study

---

## 1. Overview & Objectives

Provide a 100% accurate, linear, and predictable progress calculation for study sessions across all session modes (`LEARN_NEW`, `PRACTICE`, `FLASHCARD`), ensuring:
1. Target session points dynamically reflect the exact required steps for the actual cards in the batch (taking into account new vs. review cards).
2. Earned points update immediately upon validating answers so the progress bar reaches 100% on the final question while feedback is displayed.
3. Completion screen transitions seamlessly with the progress bar already sitting stably at 100%.

---

## 2. Requirements & Scope

### Functional Requirements
- **Accurate Target Points**: Calculate `targetPoints` based on card composition:
  - `FLASHCARD` mode: `1.0` point per card.
  - `PRACTICE` mode: `2.0` points per card (Step 1 + Step 2 progression).
  - `LEARN_NEW` mode: `3.0` points for each brand new word (`level === 0 && learningStep === 0`) and `2.0` points for each review word in the batch.
- **Immediate Progress Reflection on Verification**:
  - Credit earned points when the answer is verified (`handleVerifyAnswer`), not delayed until `handleContinueFeedback`.
  - Ensure the progress bar animates to 100% on the last question during feedback display.
- **Smooth End-Screen Transition**:
  - Only transition to `StudyCompleted` after feedback is dismissed/continued, ensuring the user sees 100% progress before the result summary appears.

### Non-Functional Requirements
- **Type Safety**: Zero `any` bypasses, exact TypeScript typing.
- **Pure Functions**: Extract point calculation and progress percentage utilities in `study-session.utils.ts`.
- **Hook Line Limit**: Keep custom hooks <= 300 lines.

---

## 3. Architecture & Technical Contracts

### Target Points Formulation
```typescript
export function calculateTargetSessionPoints(
  poolCards: VocabularyWord[],
  mode: StudySessionMode = StudySessionMode.LEARN_NEW,
): number {
  if (poolCards.length === 0) return 1;
  if (mode === StudySessionMode.FLASHCARD) {
    return Math.max(1, poolCards.length * 1.0);
  }
  if (mode === StudySessionMode.PRACTICE) {
    return Math.max(1, poolCards.length * 2.0);
  }
  // LEARN_NEW: 3 points for brand new cards, 2 points for review cards
  const total = poolCards.reduce((acc, card) => {
    const isNew = (card.level ?? 0) === 0 && (card.learningStep ?? 0) === 0;
    return acc + (isNew ? 3.0 : 2.0);
  }, 0);
  return Math.max(1, total);
}
```

### Earned Points Delta Accounting
- Flashcard advance (`processAdvanceFromFlashcard`):
  - Fast-track known: full remaining points for this card (3.0 for new, 2.0 for review).
  - Fast-track temp / learning advance: 1.0 point.
- Answer verification (`handleVerifyAnswer`):
  - Correct answer on Step 1: +1.0 point.
  - Correct answer on Step 2: +1.0 point.
  - Incorrect answer / retry: +0.3 points.

---

## 4. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `frontend/apps/web/src/features/study/utils/study-session.utils.ts` | Accurate target points and progress calculation |
| `[MODIFY]` | `frontend/apps/web/src/features/study/hooks/use-study-answer-validation.ts` | Credit points on verification for immediate progress bar update |
| `[MODIFY]` | `frontend/apps/web/src/features/study/utils/__tests__/study-session.utils.spec.ts` | Unit tests for progress calculations |

---

## 5. Implementation & Quality Verification Checklist

- [x] Accurate target points formula for `LEARN_NEW` (3.0 for new, 2.0 for review) and `PRACTICE` (2.0).
- [x] Immediate earned point credit in `use-study-answer-validation.ts`.
- [x] No delayed jump from 50% to 100% on the last question.
- [x] All unit tests pass: `pnpm --filter web test`.
- [x] TypeScript type-check passes: `pnpm --filter web exec tsc --noEmit`.
