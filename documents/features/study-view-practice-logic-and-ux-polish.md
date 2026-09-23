# Feature Plan: Study View Practice Logic, Progress & UX Polish

> **Status**: Completed  
> **Author**: Antigravity Pair Programmer / BA  
> **Date**: 2026-09-22  
> **Target Module**: frontend/apps/web/src/features/study, frontend/apps/web/src/features/vocabulary

---

## 1. Overview & Objectives

Refine the vocabulary study experience with accurate business logic, intuitive queue progression, smooth progress bar synchronization, and an elevated, modern UI:
1. **Typing Input & Action Buttons**: Polish the typing exercise input box with sleek styling, and expand the hint/check action buttons to full-width (sharing the row equally).
2. **Practice Mode Pool Scoping**: Ensure "Practice" (`PRACTICE`) mode strictly filters for words that have already been learned by the user (level >= 1, learningStep >= 1, or masteryScore > 0), avoiding showing completely unstudied words.
3. **Missed Word Re-Queue & Visual Tag**: When a user answers incorrectly, re-queue the word to the end of the session queue with an explicit high-visibility warning badge (`Needs Review` / `Reviewing Missed Word`) in the top-left corner across all exercise types.
4. **Progress Bar & Completion Synchronization**: Ensure progress reaches 100% upon completing the final item before transitioning seamlessly to the completion screen.
5. **Harmonized Study Completed Screen**: Redesign `StudyCompleted` to match Lumen's premium, minimalist aesthetic, removing clunky box-in-box wrappers, using standard UIKit components, and supporting interactive word detail sheets on missed items.

---

## 2. Requirements & Scope

### Functional Requirements
- [x] Typing exercise input box has enhanced focus and typography; action buttons span full width in a 2-column grid (`grid-cols-2 gap-3 w-full`).
- [x] Practice mode (`StudySessionMode.PRACTICE`) strictly selects only learned cards (`level >= 1 || learningStep >= 1 || masteryScore > 0 || isWilted`). If none are learned in the folder, prompt user to start "Learn New" mode.
- [x] Missed words in quizzes are re-queued to the end of the queue with `isReviewingFailed: true`.
- [x] All exercise views (`StudyTyping`, `StudyChoiceMeaning`, `StudyChoiceTerm`) display a standardized warning badge for re-queued items in the top-left area.
- [x] Progress calculation accurately reflects completed steps, reaches 100% on the final answer, and transitions cleanly.
- [x] `StudyCompleted` screen is elevated to match Flashcard/Learn New completion aesthetics with clean typography, stat badges, and interactive term sheets.

### Non-Functional Requirements
- Zero TypeScript (`tsc --noEmit`) and ESLint errors.
- Strict adherence to Lumen UIKit rules: no button re-styling overrides, no box-in-box nesting, standard UIKit badges.
- All custom hooks stay well within the <= 300 LOC limit.

---

## 3. UI/UX Specifications (Frontend)

- **Input Component**: Clean `Input` with prominent focus ring, centered text, and full-width dual button row (`[Hint]`, `[Check]`).
- **Review Badge**: Standardized `<Badge variant="warning" size="sm">` with icon (`refresh-cw`) for re-queued missed words.
- **Completion Screen**: Clean airy layout with centered celebratory checkmark, high-contrast stats grid, and scrollable list of missed terms with dotted underlines.
- **i18n Localization**: Maintain parity across `en.json` and `vi.json` for all study tags, hints, and completion copy.

---

## 4. Architecture & Technical Contracts

### Frontend (Next.js App Router)
- **`use-folder-study-actions.ts`**: Update `handlePractice` to use `learnedCardsList`. If empty, notify and route to `handleLearnNew`.
- **`study-session.utils.ts`**: Ensure `resolveStudyPool` for `PRACTICE` strictly filters learned cards.
- **`study-typing.tsx`**: Update layout to `grid grid-cols-2 gap-3 w-full` for action buttons, refine input presentation.
- **`study-choice-meaning.tsx` & `study-choice-term.tsx` & `study-typing.tsx`**: Standardize the `isReviewingFailed` badge.
- **`study-completed.tsx`**: Enhance layout, stats presentation, and action buttons.

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `features/study/components/study-typing.tsx` | Full-width buttons & input polish |
| `[MODIFY]` | `features/study/components/study-choice-meaning.tsx` | Standardized review badge |
| `[MODIFY]` | `features/study/components/study-choice-term.tsx` | Standardized review badge |
| `[MODIFY]` | `features/study/components/study-completed.tsx` | Harmonized completion UI |
| `[MODIFY]` | `features/study/utils/study-session.utils.ts` | Practice pool filtering & progress calculation |
| `[MODIFY]` | `features/vocabulary/hooks/use-folder-study-actions.ts` | Practice action learned cards check |
| `[MODIFY]` | `shared/i18n/messages/en.json` & `vi.json` | Study copy & badge translations |

---

## 6. Implementation & Quality Verification Checklist

- [x] Frontend build check: `tsc --noEmit` passes with 0 errors.
- [x] Frontend lint check: `eslint` passes with 0 errors.
- [x] No button style overrides on UIKit `<Button>`.
- [x] All hooks remain <= 300 LOC.
- [x] No browser automation tools used for testing.

---

## 7. Risks & Technical Considerations

- When all words in a folder are unlearned, `handlePractice` must gracefully suggest learning new words first rather than failing or showing a blank screen.
