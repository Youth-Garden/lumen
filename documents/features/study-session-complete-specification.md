# Feature Specification: Study Session Engine & Interactive Player

> **Module**: `frontend/apps/web/src/features/study` + `backend/src/contexts/vocabulary`
> **Status**: Verified & Implemented
> **Author**: Antigravity Pair Programming
> **Last Updated**: 2026-09-21

---

## 1. Overview & Business Intent

The **Study Session Engine** is the primary interactive learning interface in Lumen. It provides a multi-phase learning flow that introduces unlearned words through flashcards, tests comprehension with adaptive quizzes, reinforces retention via spaced repetition (SRS), and strictly safeguards learning sessions from accidental dismissals.

---

## 2. 4 Study Entry Points & Scope Resolution

Users can initiate a study session from 4 distinct areas in the application:

| Entry Point | UI Trigger | Scope Resolution | Default Session Mode |
| :--- | :--- | :--- | :--- |
| **1. Overview Dashboard** | Quick Start / Daily Review Button | Global unlearned pool or all due flashcards across all folders | `LEARN_NEW` or `PRACTICE` |
| **2. Folder Detail (Pin Folder)** | "Learn New" / "Study" Action Buttons | Resolves vocabulary cards strictly belonging to that specific Folder | `LEARN_NEW` |
| **3. Topic Detail** | Topic Action Button | Resolves vocabulary cards strictly belonging to the selected Topic | `LEARN_NEW` |
| **4. Word Detail / Flashcard Due Page** | "Review Due Cards" Button | Resolves all currently due/wilted flashcards for the authenticated user | `PRACTICE` |

---

## 3. Quota Tiers & New Word Batches

Study sessions support 4 configurable quota tiers configured in `LESSON_QUOTA_CONFIGS`:

| Quota Tier ID | Total Question Range | New Words Count (`newWordsCount`) | Target Session Points Multiplier |
| :--- | :--- | :--- | :--- |
| `TIER_1` (Light) | 7 – 10 questions | **3 new words** | 3.0x |
| `TIER_2` (Standard) | 11 – 15 questions | **5 new words** | 3.0x |
| `TIER_3` (Intensive) | 16 – 20 questions | **7 new words** | 3.0x |
| `TIER_4` (Marathon) | 20 – 26 questions | **10 new words** | 3.0x |

---

## 4. 2-Phase Learning Lifecycle

```mermaid
graph TD
    Start([User Starts Session]) --> ResolvePool[Resolve Study Pool]
    ResolvePool --> CheckMode{Mode == LEARN_NEW?}
    
    CheckMode -->|Yes| Phase1[Phase 1: Flashcard Introduction]
    CheckMode -->|No| Phase2[Phase 2: Adaptive Quizzes]
    
    Phase1 -->|Rate '1' - Mastered| FastTrackKnown[Jump to Level 6 - Excluded from Quiz]
    Phase1 -->|Rate '2' - Review| FastTrackTemp[Jump to Level 3 - Excluded from Quiz]
    Phase1 -->|Rate 'Enter' - Don't Know| EnqueueQuiz[Add to Phase 2 Quiz Queue]
    
    FastTrackKnown --> Phase1Done{All Phase 1 Cards Finished?}
    FastTrackTemp --> Phase1Done
    EnqueueQuiz --> Phase1Done
    
    Phase1Done -->|No| Phase1
    Phase1Done -->|Yes| Phase2
    
    Phase2 --> Exercise[Exercise: Choice Term / Choice Meaning / Typing]
    Exercise --> SubmitAnswer{Answer Correct?}
    
    SubmitAnswer -->|Yes (Step 1)| Step2[Advance to Step 2 Typing]
    SubmitAnswer -->|Yes (Step 2)| Mastered[Mark Word Mastered in Session]
    SubmitAnswer -->|No| Retry[Inject Retry Exercise at Index 3]
    
    Step2 --> Phase2Done{Queue Empty & Points Met?}
    Mastered --> Phase2Done
    Retry --> Phase2
    
    Phase2Done -->|No| Phase2
    Phase2Done -->|Yes| Summary[Show Session Summary & XP Earned]
```

---

## 5. Multi-Tier Distractor Engine

When generating 4-choice questions (`CHOICE_TERM` or `CHOICE_MEANING`), 3 incorrect distractors are selected according to strict priority:
1. **Priority 1 (Same Topic Pool)**: Selected from words in the active batch.
2. **Priority 2 (Same Folder Fallback Pool)**: Selected from sibling topics in the same folder.
3. **Priority 3 (System Global Pool)**: Selected from system-wide vocabulary.
4. **Fallback (Typing Exercise)**: If fewer than 3 unique distractors exist across all pools, the system automatically falls back to a `TYPING` exercise.

---

## 6. Multi-Layer Exit Protection Mechanism

To prevent users from losing active study progress by accidentally closing the modal:
- **`Escape` Key Interception**: Overridden in `useStudyShortcuts` to open `StudyConfirmExitDialog`.
- **Overlay Clicks**: `onPointerDownOutside` is cancelled via `e.preventDefault()`.
- **Browser Back / Gesture Swipe**: `useBlockBrowserBack` pushes a sentinel state to `window.history` and intercepts `popstate` events, keeping the session open and presenting the exit confirmation dialog.
