# Frontend Architecture & Engineering Guidelines — Lumen

> **Source of Truth**: This document details the Next.js frontend architecture, service layer patterns, state management, and code standards for the **Lumen Web Application** (`apps/web` and `packages/uikit`).

---

## 1. System Overview & Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **UI & Styling**: TailwindCSS + `@lumen/uikit` (Base UI components & design tokens)
- **State & Data Fetching**: TanStack Query (React Query) v5, Zustand for global UI state
- **Internationalization**: `next-intl` (App Router i18n support for `vi` and `en`)
- **HTTP Client**: `@lumen/shared-api` (Axios wrapper with mapper registry integration)

---

## 2. Codebase Organization & Directory Structure

```text
apps/web/src/
├── app/                  # Next.js App Router pages and layouts ([locale]/...)
├── features/             # Feature modules (Domain-driven UI)
│   ├── auth/             # Login, authentication pages & components
│   ├── dashboard/        # Overview, metrics, heatmap calendar
│   ├── study/            # Study session player, flashcards, quiz generator
│   └── vocabulary/       # Vocabulary bank, folder list, word management
├── services/             # HTTP API Services & Domain Mappers
│   ├── core/             # Base HTTP service & registry primitives
│   ├── auth/             # Auth API service
│   ├── material/         # Material API service
│   ├── progress/         # Progress & leaderboard service
│   ├── study/            # Study & flashcard review service
│   └── vocabulary/       # Vocabulary & folder management service
├── shared/               # Cross-feature utilities, hooks, and constants
└── store/                # Global UI Zustand stores
```

---

## 3. Service Layer & API Conventions

### 3.1. Strict Domain Separation Across Services
- API services in `src/services/` MUST be strictly separated along business domain boundaries.
- `vocabulary` domain (words, folders, flashcard CRUD) is completely isolated from `study` domain (due flashcards, review submission, study session state).
- **Clean Service Imports**: Always import types, services, and keys directly from the domain root:
  ```ts
  // ✅ Correct
  import { VocabularyWord, Folder } from '@/services/vocabulary';
  import { DueFlashcard, FlashcardRating } from '@/services/study';

  // ❌ Incorrect (Do NOT use deep file paths)
  import { VocabularyWord } from '@/services/vocabulary/vocabulary.types';
  ```

### 3.2. HTTP Service Query Serialization Rule
- When invoking `this._get(url, params)` inside a service class, pass the query parameter object **directly as the 2nd argument**.
  ```ts
  // ✅ Correct (Serializes as ?folderId=123&limit=20)
  this._get<DueFlashcard[]>(ApiEndpointEnum.STUDY_FLASHCARDS_DUE, params);

  // ❌ Incorrect (Serializes as ?params[folderId]=123)
  this._get<DueFlashcard[]>(ApiEndpointEnum.STUDY_FLASHCARDS_DUE, { params });
  ```

### 3.3. Over-fetching Prevention for Metrics & Badges
- Components MUST NOT fetch full list endpoints (e.g., `/due` or `/words`) solely to compute `.length` for counter badges.
- Metrics and counts MUST be retrieved directly from `GET /overview` response (e.g. `overview.dueCount`).

---

## 4. Mapper Registry & Type Certainty

1. **Mapper Registry Requirement**: Every API endpoint MUST be registered in a `MapperRegistry` (`[feature].registry.ts`) using standard mappers (`wordMapper`, `folderMapper`, `idResponseMapper`, `voidResponseMapper`).
2. **Type Safety in Mappers**: In mapper functions (`[feature].mappers.ts`), raw backend payloads must be typed safely as `Record<string, unknown> | null` or `unknown` (never bypass TypeScript compiler with `any`).
3. **Strict Type Certainty**: Avoid careless optional (`?`) or `| null` modifiers on guaranteed fields. Data schema contracts must be explicit and reliable.

---

## 5. React Custom Hook Guidelines

1. **Strict Hook Line Limit (<= 300 Lines)**:
   - A React custom hook MUST NOT exceed **300 lines of code**.
2. **Pure Utility Extraction First**:
   - Extract algorithms, queue calculations, and data transformations into pure helper functions in `utils/`.
   - Pure functions have no React lifecycle overhead, are 100% testable, and prevent hook coupling.
3. **Unidirectional Data Flow**:
   - Sub-hooks (e.g. `useStudyAudio`, `useStudyShortcuts`) must remain independent and unidirectional, receiving props without circular state ping-pong callbacks.

---

## 7. Global State Management (Zustand Stores)

Global client state in `src/store/` is organized into distinct, focused Zustand stores:
- **`useAuthStore`** (`auth.store.ts`): User authentication, tokens, session expiration.
- **`useUiStore`** (`ui.store.ts`): Sidebar collapsed state, global Command Palette modal state.
- **`usePreferencesStore`** (`preferences.store.ts`): User-customized app preferences (sound effects toggle, volume, pronunciation accent, study quota presets, shortcuts display).

See [`documents/preferences-store.md`](./preferences-store.md) for full architectural specifications.

---

## 8. Verification & Build Standards

- Before declaring any code complete or committing changes:
  - Run `cmd.exe /c "pnpm --filter web build"` to ensure 0 TypeScript compilation or linting errors.
  - Verification MUST be done via terminal builds and static code analysis (no browser automation).
