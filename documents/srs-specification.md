# Spaced Repetition System (SRS) & Study Engine Specification

> **Source of Truth**: This document defines the core mechanics, data structures, algorithms, pool resolution, exercise flows, and API synchronization contracts for the Spaced Repetition System (SRS) and Study Session Engine across the Lumen platform.
> Any changes to SRS or study logic must be synchronized with this document.

---

## 1. Data Schema & Persistence

### 1.1 `UserProgressEntity` Schema

```typescript
interface UserProgress {
  id: string;
  userId: string;
  flashcardId: string;

  // Display status & mastery metrics
  masteryScore: number; // Actual mastery percentage: 0.0 -> 100.0 (%)
  level: number; // 0: Unlearned | 1..4: Learning | 5: Mastered
  isWilted: boolean; // Computed signal at query-time via nextReviewAt <= now

  // Interval & SRS calculation metrics
  learningStep: number; // Counter for Level 0→1 transition: accumulated 0 -> 6 correct attempts
  reviewCountAtCurrentLevel: number; // Track reviews within the active stage (resets on stage change or failure)
  intervalDays: number; // Days interval until the next scheduled review

  // Timestamps (UTC)
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.2 Authoritative Authority: Query-Time Computed Wilted Status

- **Persisted `isWilted` Field**: Reset to `false` when a word is reviewed correctly (`reviewCorrect()`) or reset to unlearned (`resetToUnlearned()`).
- **Authoritative Wilted Evaluation**: Proactive background cron jobs writing `isWilted = true` are avoided to eliminate write amplification and stale database states. Instead, "wilted" status is computed deterministically at query time:
  ```sql
  isWilted = (progress.nextReviewAt IS NOT NULL AND progress.nextReviewAt <= NOW()) OR progress.isWilted = true
  ```
- **Performance Guarantee**: Indexed query on composite index `@Index('idx_user_progress_due', ['userId', 'nextReviewAt'])` guarantees sub-millisecond filtering across thousands of user flashcards.

---

## 2. Retention Stage Hierarchy & Plant Growth Metaphor

Visual progression is mapped to a living plant metaphor across 6 distinct stages:

| Level | Stage Name | Mastery Score | Visual Metaphor | Lit Bars | Interval Days |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **0** | Unlearned | 0% | Unplanted Seed | 0 / 5 | N/A |
| **1** | Beginner | 1% – 20% | Sprouted Seed | 1 / 5 | 4 hours (0.16d) |
| **2** | Developing | 21% – 40% | Growing Sapling | 2 / 5 | 1 day |
| **3** | Retaining | 41% – 60% | Two-leaf Plant | 3 / 5 | 3 days |
| **4** | Memorized | 61% – 80% | Budding Flower | 4 / 5 | 7 days |
| **5** | Mastered | 81% – 100% | Blooming Sunflower | 5 / 5 | 30 days → doubled on each valid review (cap: 180d) |

> **Wilted State Override**: If `nextReviewAt <= now`, the plant status visually transitions to **🥀 Wilted** regardless of current level, prompting the user to "water" the plant via a review session.

---

## 3. SRS Algorithm & State Machine Transitions

### 3.1. Seed Planting Phase (Level 0 → Level 1)

- Requires a cumulative total of **6 correct answers** (persisted across sessions in database).
- On each correct answer:
  ```text
  learningStep += 1
  masteryScore = min(20, learningStep * (20 / 6))
  ```
- When `learningStep >= 6`:
  ```text
  level = 1
  masteryScore = 20%
  intervalDays = 0.16 (4 hours)
  nextReviewAt = now + 4 hours
  ```

### 3.2. Periodic SRS Review Phase (Level 1 → Level 5)

| Transition | Required Correct Reviews | New Mastery Score | Next Interval Days |
| :---: | :---: | :---: | :---: |
| **Level 1 → 2** | 2 valid reviews | 40% | 1 day |
| **Level 2 → 3** | 2 valid reviews | 60% | 3 days |
| **Level 3 → 4** | 1 valid review | 80% | 7 days |
| **Level 4 → 5** | 1 valid review | 100% | 30 days |
| **Level 5 → 5** | Ongoing reviews | 100% | `min(180, intervalDays * 2)` |

> **Valid Review Definition**: Reviewing a card when `current_time >= nextReviewAt`.

### 3.3. Fast-Track Evaluation Shortcuts

Users can fast-track cards during initial flashcard reviews without grinding all quiz steps:

| Action | Resulting State | New Mastery | Next Interval |
| :--- | :--- | :---: | :--- |
| **"Temporary Memory" (Key 2)** | `level = 2`, `reviewCount = 0` | 40% | `now + 1 day` |
| **"Already Known" (Key 1)** | `level = 5`, `reviewCount = 0` | 100% | `now + 30 days` |

### 3.4. Incorrect Answer Penalties & Demotion

When a user fails a review or submits an incorrect quiz answer:
```text
masteryScore = max(0, masteryScore - 20)
level = floor(masteryScore / 20)
intervalDays = 0.16 (4 hours)
nextReviewAt = now + 4 hours
reviewCountAtCurrentLevel = 0
```
- A single failure instantly sets the card to due within 4 hours.
- In-session missed cards are tagged with `isReviewingFailed: true` and re-queued to ensure mastery before session exit.

---

## 4. Study Session Modes & Scope Resolution

### 4.1 Entry Points & Scope Scenarios

| Entry Scope | Entry Point | Target Words Pool | Mode Options |
| :--- | :--- | :--- | :--- |
| **Full Folder** | `FolderDetailPage` | All cards across all topics in folder | `LEARN_NEW`, `PRACTICE`, `FLASHCARD` |
| **Single Topic** | `TopicDetailPage` | Cards scoped to the selected topic | `LEARN_NEW`, `PRACTICE`, `FLASHCARD` |
| **Global Quick Start** | Dashboard / Folder List | Global due pool across all active folders | `LEARN_NEW`, `PRACTICE` |

### 4.2 Mode Specifications

#### 1. `LEARN_NEW` Mode
- **Intent**: Introduce unlearned words in structured batches while interleaving due cards for retention.
- **Backend Query**: `GET /vocabulary/words/due?includeNew=true&folderId=:id&limit=200`
- **Pool Partitioning** (`resolveStudyPool`):
  - `unlearned`: `level=0 AND step=0 AND masteryScore=0` → picks `newWordsCount` (default: 5).
  - `review`: remaining due/in-progress cards → fills up to `targetCount` (default: 20).
- **Session Queue**:
  - New cards start with `FLASHCARD` introduction.
  - Review cards start directly with quiz progression (`CHOICE_TERM` or `CHOICE_MEANING`).

#### 2. `PRACTICE` Mode
- **Intent**: High-intensity review of learned cards (`level >= 1 || learningStep >= 1 || masteryScore > 0 || isWilted`). No new words introduced.
- **Backend Query**: `GET /vocabulary/words/due?includeNew=false&folderId=:id&limit=200`
- **Graceful Fallback**: If zero cards are technically due in the folder, all learned folder cards are made available to avoid deadlocks. If no cards have ever been studied, user is prompted to start `LEARN_NEW`.
- **Session Queue**: All cards enter directly into multi-step quiz progression (Step 1 multiple-choice → Step 2 typing).

#### 3. `FLASHCARD` Mode
- **Intent**: Casual self-paced browsing and self-rating.
- **Pool Query**: `GET /vocabulary/words/folders/:id/words?page=1&limit=200`
- **Batch Progress**: Flashcard ratings (`Known`, `Again`, `Fast-Track`) are captured into `pendingReviewsRef` and flushed via batch review on completion.

---

## 5. Question Generation & Distractor Fallback Hierarchy

For multiple-choice exercises (`CHOICE_TERM`, `CHOICE_MEANING`), exactly **4 unique options** are guaranteed from genuine vocabulary data (zero artificial/mock fallback arrays):

1. **Priority 1 (Active Pool / Same Topic)**: Random distinct words from the active batch or selected topic.
2. **Priority 2 (Same Folder)**: If fewer than 3 distractors exist, select additional words from the parent Folder.
3. **Priority 3 (System Global DB Pool)**: If folder has fewer than 3 distractors, fill remaining slots from the system-wide Vocabulary bank (`limit: 100`).
4. **Typing Fallback**: If fewer than 3 distractors exist across all pools, automatically fall back to a `TYPING` exercise.

---

## 6. Batch Review Synchronization & Performance

### 6.1 Unified Single-Flush Session Completion

- Reviews during active learning sessions do NOT issue single-card HTTP requests.
- Each evaluation writes to an in-memory `pendingReviewsRef: Map<string, BatchReviewItemDto>`.
- Multiple attempts on the same card (e.g. initial failure followed by retry success) update the map so **only the latest state** is persisted.
- Upon session finish (`isFinished = true`), a single batch request is dispatched:
  ```http
  POST /vocabulary/words/flashcards/review-batch
  Content-Type: application/json

  {
    "reviews": [
      { "flashcardId": "uuid-1", "isCorrect": true },
      { "flashcardId": "uuid-2", "isCorrect": false, "isFastTrackTempMemory": false }
    ]
  }
  ```

### 6.2 Backend Bulk Data Resolution (Zero N+1 Queries)

In `BatchReviewFlashcardsHandler`:
1. Collect all `flashcardIds` from the payload.
2. Bulk fetch flashcards: `flashcardRepo.findManyByIds(flashcardIds)`.
3. Bulk fetch user progress: `userProgressRepo.findManyByUserAndFlashcards(userId, flashcardIds)`.
4. Apply aggregate domain logic in-memory.
5. Persist updated progress aggregates.

---

## 7. Progress & Target Points Accounting

To prevent jarring progress jumps and ensure the progress bar hits 100% on the final answer before screen transition:

### 7.1 Target Points Formulation
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
  const total = poolCards.reduce((acc, card) => {
    const isNew = (card.level ?? 0) === 0 && (card.learningStep ?? 0) === 0;
    return acc + (isNew ? 3.0 : 2.0);
  }, 0);
  return Math.max(1, total);
}
```

### 7.2 Earned Points Crediting
- **Answer Validation**: Points are credited immediately upon verifying the answer in `handleVerifyAnswer`, ensuring the progress bar updates while the feedback drawer is displayed.
- **Step 1 Correct**: `+1.0` point.
- **Step 2 Correct**: `+1.0` point.
- **Incorrect / Retry**: `+0.3` points.
- **Fast-Track Known**: Full remaining points for the card (`3.0` for new, `2.0` for review).

---

## 8. Infinite Scroll & Vocabulary List Pagination

- All folder and topic word lists utilize TanStack Query's `useInfiniteQuery` with a 50-word page limit (`vocabularyKeys.folderWordsInfinite(folderId, topic)`).
- Intersection Observer triggers automatic `fetchNextPage()` when scrolling near the list sentinel, supporting collections with 2,000+ words without memory bloat or request limits.
- Core pagination mappers strictly return `null` when inputs are missing/empty, avoiding misleading fake fallback numbers (`?? 20`, `?? 1`).
