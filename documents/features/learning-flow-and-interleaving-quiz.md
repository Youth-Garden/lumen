# Feature Plan: Adaptive Learning Flow, Interleaving Quiz Engine & Smooth Progress Tracking

> **Status**: In Review  
> **Author**: Antigravity Pair Programmer / BA  
> **Date**: 2026-09-20  
> **Target Module**: `frontend/apps/web/src/features/study`, `backend/src/modules/study`

---

## 1. Overview & Objectives

Optimize the core Vocabulary Study & Practice engine ("Học từ mới" & "Luyện tập") in Lumen. The objective is to provide an intuitive, pedagogically sound, and engaging learning experience:
1. **First-encounter Flashcard Guarantee**: All brand-new words (or unlearned words) must first be presented as an interactive Flashcard for initial semantic and phonetic acquisition.
2. **Interleaving Quiz Hierarchy**: After initial exposure, vocabulary words are systematically tested through interleaved exercises (`CHOICE_TERM`, `CHOICE_MEANING`, `TYPING`), seamlessly mixed with recent review words.
3. **Typing Exercise with Hint Integration**: Ensure `TYPING` (view Vietnamese meaning -> type English term with Shift hint shortcut) is consistently presented as the final retention checkpoint.
4. **Smooth & Realistic Progress Tracking**: The progress bar must continuously advance on every user interaction (including partial credit for attempted answers) rather than remaining frozen at 0% until a word is completely evicted from memory queues.
5. **Finite & Deterministic Session Lifecycle**: Guarantee that every study session converges smoothly to 100% completion without infinite repetition loops.

---

## 2. Requirements & Scope

### Functional Requirements
- [ ] **Flashcard Discovery Gate for New Words**:
  - In `LEARN_NEW` mode, every word with `level = 0` / `learningStep = 0` starts with a `FLASHCARD` step.
  - User self-evaluates (`Đã thuộc` / `Nhớ tạm` / `Ôn lại` / `Chưa biết`).
  - Fast-track "Đã thuộc" (Mastered immediately) completes the word without redundant exercises.
  - "Nhớ tạm" / "Ôn lại" / "Chưa biết" enqueues follow-up active recall exercises (`CHOICE` -> `TYPING`).
- [ ] **Structured Exercise Progression Pipeline**:
  - Step 1: `FLASHCARD` (Semantic discovery & pronunciation).
  - Step 2: Recognition (`CHOICE_TERM` or `CHOICE_MEANING` - 4 options if pool >= 4, or skip to Typing if pool < 4).
  - Step 3: Production (`TYPING` - typing English term from Vietnamese definition with Shift hint).
- [ ] **Interleaving & Mixed Queue Management**:
  - Break session words into micro-batches (e.g. 3-4 words at a time) so the user learns 3-4 flashcards, then immediately practices quizzes on those 3-4 words interspersed with review cards.
  - When wrong: Re-insert a targeted retry exercise (`CHOICE` or `TYPING`) 2-3 positions later in the queue.
- [ ] **Smooth Cumulative Progress Bar**:
  - Replace coarse "all-or-nothing" word completion ratio with a cumulative weighted step counter:
    $$\text{Progress \%} = \min\left(100, \text{round}\left(\frac{\text{Total Completed Interaction Points}}{\text{Total Expected Session Points}} \times 100\right)\right)$$
  - Each interaction grants points:
    - Flashcard advance: $+1$ point
    - Correct Quiz/Typing answer: $+2$ points
    - Incorrect Answer (effort & review attempt): $+0.5$ points (minor nudge so user feels progress while still requiring mastery)
  - Target Session Points dynamically calculated from initial queue size and target mastery steps.
- [ ] **Typing Hint Integration**:
  - Pressing `Shift` (or clicking hint button) reveals the next letter of the word up to a maximum number of hints, enabling the user to recover without getting permanently stuck.

### Non-Functional Requirements
- Strictly comply with Lumen frontend rules:
  - Custom React hooks <= 300 lines of code.
  - Pure algorithmic utilities isolated in `src/features/study/utils/`.
  - Zero `any` type bypasses.
  - Zero hardcoded UI text strings (all centralized in `messages/{locale}.json`).

---

## 3. UI/UX Specifications (Frontend)

- **Progress Bar**: Smooth CSS animation transitions (`transition-all duration-300 ease-out`).
- **Choice Options Selection**: Clean neutral surface (`bg-muted text-foreground`).
- **Typing Input Box**: Clean input with instant validation feedback and Shift shortcut for hints.
- **Completed Screen**: Celebratory `study-graduate` SVG vector icon with transparent background and performance breakdown.

---

## 4. Architecture & Technical Contracts

### State Management & Pure Utilities
- `study-session.utils.ts`:
  - `calculateSessionTargetPoints(initialQueue)`: Computes base session weight.
  - `calculateCumulativeProgressPercent(earnedPoints, targetPoints)`: Produces monotone-increasing percentage.
  - `buildInterleavedStudyQueue(poolCards, mode, fallbackPool, globalPool)`: Creates structured micro-batches.
  - `scheduleRetryExercise(activeQueue, currentCard, failedExerciseType)`: Re-inserts error recovery steps with interleaving distance.

### Hook Modularization (`use-study-session.ts`)
- Core hook maintained strictly under 300 lines by delegating queue scheduling, progress calculation, and rating evaluation to pure utility functions.

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `frontend/apps/web/src/features/study/types/study.types.ts` | Add queue step metadata and progress point tracking |
| `[MODIFY]` | `frontend/apps/web/src/features/study/utils/quiz-generator.ts` | Ensure `TYPING` questions and 4-distractor fallbacks work seamlessly |
| `[MODIFY]` | `frontend/apps/web/src/features/study/utils/study-session.utils.ts` | Interleaving batch generator, smooth progress formula, and retry scheduler |
| `[MODIFY]` | `frontend/apps/web/src/features/study/hooks/use-study-session.ts` | Integration of smooth progress and interleaved queue lifecycle |
| `[MODIFY]` | `frontend/apps/web/src/features/study/components/study-typing.tsx` | Enhanced typing hints and keyboard ergonomics |

---

## 6. Implementation & Quality Verification Checklist

- [ ] All new words start with `FLASHCARD` in `LEARN_NEW` mode.
- [ ] `TYPING` questions appear consistently as part of the learning cycle.
- [ ] Progress bar increases smoothly on every answer (correct: solid increment, wrong: slight increment) and reaches 100% on session completion.
- [ ] Multiple-choice questions only appear when >= 4 words exist; otherwise seamlessly uses `TYPING` and `FLASHCARD`.
- [ ] `pnpm --filter web lint` and `tsc --noEmit` pass with 0 errors.
- [ ] Hook lines of code strictly <= 300 lines.
