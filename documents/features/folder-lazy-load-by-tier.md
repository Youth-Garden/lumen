# Feature Plan: Folder Browse Lazy-Load by Tier

> **Status**: Completed
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-16
> **Target Module**: backend/src/contexts/vocabulary | frontend/apps/web/src/features/vocabulary

---

## 1. Overview & Objectives

Currently, opening a vocabulary folder previously called `GET /vocabulary/words/folders/:id`, which returned the entire `flashcards[]` array (often 200+ words with full definitions, examples, phonetics, and audio URLs) in a single payload. The frontend then filtered words by topic client-side. This over-fetching was the root cause of high latency and heavy memory usage when opening folders.

Because `topic` is a column on `WordEntity` (`word.topic`) and not a separate entity table, we cannot implement a strict 3-tier entity model. Instead, we separate the functionality into tier-based API endpoints:

- **Tier 1**: `GET /vocabulary/words/folders` → List folders with aggregate counts (`flashcardCount`, `learnedCount`, `dueCount`).
- **Tier 2**: `GET /vocabulary/words/folders/:id/topics` → List topic aggregate statistics (`topic`, `topicVi`, `topicImageUrl`, `count`, `learnedCount`, `dueCount`) without raw flashcard data.
- **Tier 3**: `GET /vocabulary/words/folders/:id/flashcards?topic=...&page=1&limit=50` → Paginated list of flashcards belonging to the specified folder and topic.
- **Backward Compatibility**: `GET /vocabulary/words/folders/:id` → Stripped of `flashcards[]`, returning lightweight summary info (`FolderDetailResponseDto`).

---

## 2. Requirements & Scope

### Functional Requirements
- [x] Tier 1 `GET /vocabulary/words/folders` returns lightweight folder list with aggregate counts.
- [x] Tier 2 `GET /vocabulary/words/folders/:id/topics` returns topic-level aggregate metrics for the folder.
- [x] Tier 3 `GET /vocabulary/words/folders/:id/flashcards?topic=...` returns paginated flashcards matching the specified topic in the folder.
- [x] Tier 2 endpoint accepts query parameter `?topic=...` via `ListFolderFlashcardsDto` extending `PaginationDto` to avoid URL path encoding issues for Vietnamese/special characters.
- [x] Frontend `FolderDetailPage` loads topics first on folder entry, and only fetches flashcards when a user clicks into a specific topic.
- [x] TanStack Query keys are updated to cache topics (`['folderTopics', folderId]`) and topic flashcards (`['folderFlashcards', folderId, topic]`) independently.

### Non-Functional Requirements
- **Performance**: Response payload for `GET /folders/:id` reduced from ~500KB+ to <1KB.
- **Type Safety**: Zero `any` bypasses across backend CQRS/DTOs and frontend services/mappers/components.
- **Clean Separation**: UI layer consumes mapper functions and TanStack Query custom hooks.
- **Design System Alignment**: Preserved flat aesthetic, no manual `<Button>` styling overrides, clean typography hierarchy.

### Out of Scope
- Creating a DB migration for `topics` table (topic remains a column on `WordEntity`).
- Modifying SRS learning algorithm or study session logic.

---

## 3. UI/UX Specifications (Frontend)

- **Folder Grid View**: Renders circular topic cards using `useFolderTopics(folderId)`. Show Skeleton loading state while fetching topics.
- **Topic Words View**: Renders paginated list of words using `useFolderFlashcards(folderId, selectedTopic)`. Enabled only when `isViewingWords && Boolean(selectedTopic)`.
- **Breadcrumbs**: Navigating into a topic updates breadcrumb to `Folders > Folder Name > Topic Name`. Clicking folder name returns to topic grid view without refetching topics (served from React Query cache).
- **Clean Architecture**: Direct prop passing, no ad-hoc fallback values or array transformations inside React JSX.

---

## 4. Architecture & Technical Contracts

### Backend (NestJS CQRS Architecture)
- **Port**: `IVocabularyQueryRepository` defines:
  - `findFolderTopics(folderId: string, userId: string): Promise<FolderTopicResponseDto[]>`
  - `findFlashcardsByFolderAndTopic(folderId: string, userId: string, topic?: string, page?: number, limit?: number): Promise<FolderFlashcardsResponseDto>`
- **Repository**: `VocabularyQueryRepository` implements SQL query aggregations via TypeORM `QueryBuilder`:
  - `findFolderTopics`: `GROUP BY word.topic, word.topicVi, word.topicImageUrl` with `COUNT(DISTINCT flashcard.id)`.
  - `findFlashcardsByFolderAndTopic`: Join `word`, `definitions`, `examples`, and user `progress` filtered by `folderId` and `topic`.
- **Queries & Handlers**:
  - `ListFolderTopicsQuery` & `ListFolderTopicsHandler`
  - `ListFolderFlashcardsQuery` & `ListFolderFlashcardsHandler`
- **DTOs & Responses**:
  - `ListFolderFlashcardsDto` (extends shared `PaginationDto`)
  - `FolderTopicResponseDto`
  - `FolderFlashcardsResponseDto` & `FlashcardSummaryDto`
  - `FolderDetailResponseDto` (extends `FolderResponseDto`, removing `flashcards` property)

### Frontend (Next.js App Router)
- **Constants**: `ApiEndpointEnum.VOCABULARY_FOLDER_TOPICS` (`/api/vocabulary/words/folders/:id/topics`) and `VOCABULARY_FOLDER_FLASHCARDS` (`/api/vocabulary/words/folders/:id/flashcards`).
- **Registry**: `MapperRegistry` registers endpoints with `folderTopicListMapper` and `folderFlashcardsPageMapper`.
- **Service Layer**: `VocabularyService.getFolderTopics(folderId)` and `getFolderFlashcards(folderId, topic, page, limit)`.
- **Hooks**: `useFolderTopics` and `useFolderFlashcards` inside `features/vocabulary/hooks/use-vocabulary.ts` (re-exported via `hooks/index.ts`).
- **Page Component**: Clean up `folder-detail-page.tsx` removing duplicate component definitions and client-side topic calculations.

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[NEW]` | `backend/src/contexts/vocabulary/application/dtos/list-folder-flashcards.dto.ts` | Shared `PaginationDto` inheritance for topic flashcard query |
| `[NEW]` | `backend/src/contexts/material/application/dtos/list-materials.dto.ts` | Shared `PaginationDto` inheritance for material listing |
| `[MODIFY]` | `backend/src/contexts/vocabulary/infrastructure/repositories/vocabulary-query.repository.ts` | SQL aggregation for `findFolderTopics` and `findFlashcardsByFolderAndTopic` |
| `[MODIFY]` | `backend/src/contexts/vocabulary/application/ports/vocabulary-query.repository.ts` | Ensure port interface definitions are up to date |
| `[MODIFY]` | `backend/src/contexts/vocabulary/application/responses/folder.response.dto.ts` | `FolderDetailResponseDto` extends `FolderResponseDto` |
| `[MODIFY]` | `backend/src/contexts/vocabulary/presentation/http/vocabulary.controller.ts` | Connect `@Get('folders/:id/topics')` and `@Get('folders/:id/flashcards')` with `ListFolderFlashcardsDto` |
| `[MODIFY]` | `backend/src/contexts/material/presentation/http/material.controller.ts` | Connect `ListMaterialsDto` |
| `[MODIFY]` | `frontend/apps/web/src/services/vocabulary/vocabulary.registry.ts` | Register mapper entries for `VOCABULARY_FOLDER_TOPICS` and `VOCABULARY_FOLDER_FLASHCARDS` |
| `[MODIFY]` | `frontend/apps/web/src/services/vocabulary/vocabulary.service.ts` | Ensure `getFolderTopics` and `getFolderFlashcards` are properly exposed |
| `[MODIFY]` | `frontend/apps/web/src/services/vocabulary/vocabulary.types.ts` | Verify `FolderTopic`, `FolderFlashcardsPage`, `Folder` types |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/hooks/use-vocabulary.ts` | Verify custom hooks `useFolderTopics` and `useFolderFlashcards` |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/hooks/use-folder-study-actions.ts` | Update helper to handle lazy-loaded flashcards gracefully |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/pages/folder-detail-page.tsx` | Remove duplicate block, integrate `useFolderTopics` and `useFolderFlashcards` |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/pages/folder-list-page.tsx` | Clean up unnecessary `useVocabularyFolderDetail` overfetching |
| `[MODIFY]` | `.agents/skills/backend/SKILL.md` | Add Rule 15 for Shared DTO Inheritance, SOLID & Generic Code Reuse |
| `[MODIFY]` | `.agents/AGENTS.md` | Add Strict Shared DTO Inheritance & SOLID Generic Code Reuse Rule |

---

## 6. Implementation & Quality Verification Checklist

- [x] Backend type check: `tsc --noEmit` in `backend/` passes with 0 errors.
- [x] Frontend type check: `tsc --noEmit` in `frontend/` passes with 0 errors.
- [x] ESLint check in both `backend` and `frontend` passes with 0 errors/warnings.
- [x] No `any` type bypasses across backend and frontend layers.
- [x] No manual button re-styling on `<Button>` components.
- [x] Custom hooks <= 300 lines of code.
- [x] TanStack Query keys caching (`['folderTopics', folderId]` and `['folderFlashcards', folderId, topic]`).
- [x] Zero browser automation for testing.

---

## 7. Risks & Technical Considerations

- **Topic encoding in query params**: Using `?topic=...` avoids URL path segment encoding errors with special characters (Vietnamese accents, spaces).
- **Duplicate code in `folder-detail-page.tsx`**: Removed the redundant second half of `folder-detail-page.tsx`.
