# Feature Plan: Vocabulary Management & Spaced Repetition System (SRS)

> **Status**: Completed  
> **Author**: Antigravity Pair Programmer  
> **Date**: 2026-09-16  
> **Target Module**: `backend/src/contexts/vocabulary`, `frontend/apps/web/src/features/vocabulary`

---

## 1. Overview & Objectives

Implement the core Spaced Repetition System (SRS) hybrid model for Lumen, enabling users to add vocabulary words to personal folders, track memory retention levels (Levels 0 through 5), and review due flashcards with calculated interval algorithms.

---

## 2. Requirements & Scope

### Functional Requirements
- [x] CRUD operations for personal flashcard folders and words.
- [x] Track memory stage levels (0: Unstudied -> 5: Mastered Sunflower).
- [x] Automated due flashcard filtering based on `nextReviewAt` timestamp.
- [x] Fast-track shortcuts ("Already Known" -> Level 5, "Temporary Memory" -> Level 2).
- [x] Wilted plant state (`isWilted`) when current time exceeds `nextReviewAt`.

### Non-Functional Requirements
- Indexed database lookup on `(userId, nextReviewAt)` for sub-millisecond query performance.
- Zero over-fetching on dashboard counter badges by returning `dueCount` directly in `GET /vocabulary/overview`.

---

## 3. UI/UX Specifications (Frontend)

- **Design System Alignment**: Flat, airy card layouts with clean typography hierarchy.
- **Button Styling**: Only pre-defined variants (`default`, `secondary`, `outline`, `ghost`).
- **No Box-in-Box**: Folder rows render directly on dialog/page surfaces.
- **i18n Localization**: All copy extracted to `messages/vi.json` and `messages/en.json`.

---

## 4. Architecture & Technical Contracts

### Backend (`backend/src/contexts/vocabulary`)
- **Entities**: `UserProgressEntity` with `@Index('idx_user_progress_due', ['userId', 'nextReviewAt'])`.
- **CQRS**: `ListDueFlashcardsQuery`, `GetVocabularyOverviewQuery`, `ReviewFlashcardCommand`.
- **DTOs**: `ListDueFlashcardsDto` with `@Transform` for optional `folderId`, `limit`, `includeNew`.

### Frontend (`frontend/apps/web/src`)
- **Services**: `VocabularyService` (`src/services/vocabulary`), `StudyService` (`src/services/study`).
- **Mappers**: `vocabularyOverviewMapper` returning `VocabularyOverview` with `dueCount`.

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[NEW]` | `backend/src/contexts/vocabulary/application/dtos/list-due-flashcards.dto.ts` | Query DTO transformation |
| `[MODIFY]` | `backend/src/contexts/vocabulary/infrastructure/entities/user-progress.entity.ts` | Composite index addition |
| `[MODIFY]` | `frontend/apps/web/src/services/vocabulary/vocabulary.types.ts` | Model interface update |
| `[MODIFY]` | `frontend/apps/web/src/services/vocabulary/vocabulary.mappers.ts` | Clean object mapping without `any` |

---

## 6. Implementation & Quality Verification Checklist

- [x] Backend build check: `cmd.exe /c "pnpm run build"` passes with 0 errors.
- [x] Frontend build check: `cmd.exe /c "pnpm --filter web build"` passes with 0 errors.
- [x] Zero `any` type bypasses in mappers.
- [x] Direct query parameter passing in Axios (`this._get(url, params)`).
- [x] Code comments concise, technical, in English.

---

## 7. Risks & Technical Considerations

- **Timezone Alignment**: `nextReviewAt` is stored as UTC in PostgreSQL and transformed to ISO string for standard client parsing.
