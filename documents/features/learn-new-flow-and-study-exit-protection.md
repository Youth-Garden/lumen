# Feature Plan: Learn New Architecture, Scope Resolution & Multi-Layer Exit Protection

> **Status**: Completed
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-21

> **Target Module**: `frontend/apps/web/src/features/study/...` & `frontend/apps/web/src/features/vocabulary/...`

---

## 1. Overview & Objectives

This document establishes the comprehensive architectural and pedagogical specification for **"Learn New" (`StudySessionMode.LEARN_NEW`)**, provides scope-based vocabulary resolution across all 4 entry points, formalizes quota tier distribution with 1-to-1 interleaving, and implements robust multi-layer exit protection (including browser back `popstate`, `Escape` key, and backdrop click interception).

---

## 2. Detailed Technical Architecture & Requirements

### A. Multi-Layer Exit Protection (`useBlockBrowserBack` & `StudyView`)

1. **Keyboard & Backdrop Protection (Radix/Base UI layer)**:
   - `onEscapeKeyDown={(e) => e.preventDefault()}`
   - `onPointerDownOutside={(e) => e.preventDefault()}`
2. **Browser Back & Mobile Swipe-Back Protection (`popstate` layer)**:
   - When `StudyView` opens: `window.history.pushState({ isStudySession: true }, '')`.
   - On `window.addEventListener('popstate', onPopState)`:
     - Immediately invoke `window.history.pushState({ isStudySession: true }, '')` to cancel the navigation URL jump.
     - Trigger `presentConfirmExitDialog()`.
   - When user confirms "Save & Exit":
     - Flush pending progress via `handleSaveProgress()` (`POST /api/v1/vocabulary/flashcards/batch-review`).
     - Remove `popstate` listener and perform clean history unwind (`window.history.back()`).
   - When user clicks "Continue Studying":
     - Close confirmation dialog and seamlessly resume the session.

---

### B. Quota Tier Distribution & Single Source of Truth

Tiers are configured via `useStudySettings()` (`LESSON_QUOTA_CONFIGS`) stored in `usePreferencesStore`:

```typescript
export interface LessonQuotaConfig {
  preset: LessonQuotaPreset;
  targetCount: number;
  minCount: number;
  maxCount: number;
  newWordsCount: number; // Single source of truth for new words per session
}

export const LESSON_QUOTA_CONFIGS: Record<LessonQuotaPreset, LessonQuotaConfig> = {
  [LessonQuotaPreset.FEW]: {
    preset: LessonQuotaPreset.FEW,
    targetCount: 7,
    minCount: 7,
    maxCount: 10,
    newWordsCount: 3,
  },
  [LessonQuotaPreset.MODERATE]: {
    preset: LessonQuotaPreset.MODERATE,
    targetCount: 11,
    minCount: 10,
    maxCount: 15,
    newWordsCount: 5,
  },
  [LessonQuotaPreset.MANY]: {
    preset: LessonQuotaPreset.MANY,
    targetCount: 16,
    minCount: 15,
    maxCount: 20,
    newWordsCount: 7,
  },
  [LessonQuotaPreset.A_LOT]: {
    preset: LessonQuotaPreset.A_LOT,
    targetCount: 20,
    minCount: 20,
    maxCount: 26,
    newWordsCount: 10,
  },
};
```

---

### C. "Learn New" Pedagogical Flow & Queue Lifecycle

#### Phase 1: Mandatory Flashcard Introduction for ALL New Words
- All $N_{new}$ new words (`level === 0 && learningStep === 0`) are presented **first in Flashcard mode**.
- The learner evaluates each word using 3 initial starting ratings:
  1. **Key 1 / `FAST_TRACK_KNOWN` (Mastered / Thuộc lòng)**:
     - Immediately sets `level: 6, learningStep: 6`.
     - Records mastery score and **excludes the word from subsequent quiz exercises in this session**.
  2. **Key 3 / `FAST_TRACK_TEMP` (Temp Memory / Tạm nhớ)**:
     - Sets `level: 3, learningStep: 3`.
     - Records review state and **excludes the word from immediate quiz exercises in this session** (scheduled for future spaced repetition).
  3. **Enter / `WRONG` (Learn This Word / Học từ này)**:
     - Sets `level: 0, learningStep: 0`.
     - **Enrolls the word into Phase 2 active interleaving progression exercises**.

#### Phase 2: Interleaving 1-to-1 Reinforcement Quizzes
- All words enrolled from Phase 1 + assigned review words are interleaved:
  `[New Word Quiz 1] -> [Review Word Quiz 1] -> [New Word Quiz 2] -> [Review Word Quiz 2] -> ...`
- Exercise types progress dynamically:
  1. Multiple Choice: Vietnamese Meaning (1 of 4)
  2. Multiple Choice: English Term (1 of 4)
  3. Typing / Spelling with Audio & Hint Drawer

---

### D. Context-Aware Scope Resolution Across All 4 Entry Points

| Entry Point | Context | Target Vocabulary Pool | Priority Ordering |
| :--- | :--- | :--- | :--- |
| **1. Pinned Folder Card** (`FolderListPage`) | Active Pinned Folder (`activeFolder.id`) | Unlearned words in Pinned Folder | Sequential by first topic with unlearned words |
| **2. Vocabulary Overview** (`/vocabulary` Hero/Quick Actions) | Pinned Folder or First User Folder | Unlearned words in Active/First Folder | Sequential across folder topics |
| **3. Folder Detail Page** (`FolderDetailPage`) | Current Folder (`folderId`) | Unlearned words in this specific folder | Sequential by first topic with unlearned words |
| **4. Topic Detail Page** (`TopicDetailPage`) | Current Topic (`folderId` + `topicName`) | Unlearned words strictly within this topic | Words strictly in `topicName` |

---

### E. Comprehensive Edge Cases & Fail-safes

1. **Edge Case 1: Topic / Folder has 0 unlearned words**:
   - Provide a clear toast: `"You have learned all new words in this topic! Starting Practice mode to reinforce retention."` and seamlessly launch `StudySessionMode.PRACTICE`.
2. **Edge Case 2: Available new words fewer than quota ($N_{available} < N_{new}$)**:
   - Take all $N_{available}$ new words.
   - Automatically backfill the remaining question count with due/review cards to meet the session duration.
3. **Edge Case 3: No pinned folder selected**:
   - Fallback to the first available folder in the user's catalog.
4. **Edge Case 4: Partially learned words (`level === 0 && learningStep > 0`)**:
   - Classified as active in-progress review cards (eligible for Phase 2 review queue, not treated as untouched pristine new cards).
5. **Edge Case 5: User marks all new words as "Mastered" in Phase 1**:
   - If no review words remain in queue, gracefully transition directly to `StudyCompleted` view.

---

## 3. UI/UX Specifications

- **`StudyConfirmExitDialog`**:
  - Modal with Title: `t('confirmExitTitle')` ("Pause study session?")
  - Description: `t('confirmExitDescription')` ("Your learned word progress will be saved.")
  - Actions:
    - Button `variant="secondary"`: `t('continueStudying')` ("Continue Studying")
    - Button `variant="default"`: `t('saveAndExit')` ("Save & Exit")
- **Phase 1 Flashcard Rating Bar**:
  - 3 clear starting buttons: `1 - Mastered`, `3 - Temp Memory`, `Enter - Learn This Word`.

---

## 4. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[NEW]` | `frontend/apps/web/src/features/study/hooks/use-block-browser-back.ts` | Hook for intercepting `popstate` browser back gestures |
| `[NEW]` | `frontend/apps/web/src/features/study/components/study-confirm-exit-dialog.tsx` | Confirmation dialog on exit attempt |
| `[MODIFY]` | `frontend/apps/web/src/services/study/study.types.ts` | Add `newWordsCount` to `LessonQuotaConfig` |
| `[MODIFY]` | `frontend/apps/web/src/services/study/study.constants.ts` | Configure `newWordsCount` per preset (3, 5, 7, 10) |
| `[MODIFY]` | `frontend/apps/web/src/features/study/components/study-view.tsx` | Integrate `useBlockBrowserBack`, Escape blocking, and exit dialog |
| `[MODIFY]` | `frontend/apps/web/src/features/study/utils/study-session.utils.ts` | Enforce Flashcards-first Phase 1 and 1-to-1 interleaving in Phase 2 |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/hooks/use-folder-study-actions.ts` | Fix `handleLearnNew` mode and scope resolution |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/pages/folder-detail-page.tsx` | Wire folder-level scope resolution for Learn New |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/pages/topic-detail-page.tsx` | Wire topic-level scope resolution for Learn New |
| `[MODIFY]` | `frontend/apps/web/src/shared/i18n/messages/en.json` | Add English copy for exit confirmation and Learn New hints |
| `[MODIFY]` | `frontend/apps/web/src/shared/i18n/messages/vi.json` | Add Vietnamese copy for exit confirmation and Learn New hints |

---

## 5. Implementation & Quality Verification Checklist

- [x] Pressing `Escape` does not dismiss `StudyView`.
- [x] Clicking backdrop does not dismiss `StudyView`.
- [x] Pressing Browser Back or mobile swipe-back triggers `StudyConfirmExitDialog` without URL disruption.
- [x] Clicking "Save & Exit" flushes `batchReviewFlashcards` and exits cleanly.
- [x] Clicking "Continue Studying" resumes session.
- [x] Learn New starts with Flashcard introduction of new words first.
- [x] Tier selection (FEW = 3, MODERATE = 5, MANY = 7, A_LOT = 10) produces exact new word counts.
- [x] Mastered (1) and Temp (2) advance words to Level 5 and 2 and exclude them from Phase 2 quizzes.
- [x] "Learn This Word" (Enter) schedules Phase 2 interleaving quizzes.
- [x] Scope resolution tested across all 4 entry points: Pinned Folder, Overview, Folder Detail, Topic Detail.
- [x] Edge cases (0 new words, few new words, no pinned folder) verified without crashes.
- [x] `pnpm --filter web lint` and `pnpm --filter web build` pass with 0 errors.

