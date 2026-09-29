# Feature Plan: Command Palette Authentication Guard & Auth-Route Protection

> **Status**: Completed
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-27
> **Target Module**: `frontend/apps/web/src/shared/components/command-palette.tsx` & `frontend/apps/web/src/shared/components/providers/updater/hooks/use-command-palette-listener.ts`

---

## 1. Overview & Objectives

Currently, the Command Palette (triggered via `Ctrl + K`) can be opened on unauthenticated public routes such as `/login`, `/register`, and `/forgot-password`. When an unauthenticated user opens the palette, it attempts to fetch protected vocabulary folders and search queries from the backend (`GET /api/vocabulary/folders`), resulting in `401 Unauthorized` HTTP errors and visual toast notifications on login pages.

The objective of this feature plan is to enforce a strict **Authentication Guard** on the Command Palette:
1. Prevent `Ctrl + K` keyboard shortcuts from opening the Command Palette on unauthenticated routes or when `isAuthenticated === false`.
2. Automatically dismiss any active Command Palette instance if the user's session expires or if they navigate to an unauthenticated route.
3. Ensure all internal TanStack Query hooks within `CommandPalette` (`useVocabularyFolders`, `useQueries` for sub-topics, `useVocabularyWords`) have an explicit `enabled: Boolean(isOpen) && isAuthenticated` guard to prevent unauthorized background API requests.

---

## 2. Requirements & Scope

### Functional Requirements
- [x] **Shortcut Guard**: `Ctrl + K` shortcut listener in `useCommandPaletteListener` must check `isAuthenticated` and check if current `pathname` is an unauthenticated auth route (`/login`, `/register`, `/forgot-password`, `/reset-password`). If unauthenticated or on an auth route, `Ctrl + K` must be ignored.
- [x] **Auto-Dismiss on Session Loss**: If `isOpen === true` and `isAuthenticated` becomes `false` or user lands on an auth route, `dismissCommandPalette()` must be automatically invoked.
- [x] **Query Enablement Guard**: In `CommandPalette`, all data fetching queries (`useVocabularyFolders`, sub-topic queries, `useVocabularyWords`) must explicitly require `isAuthenticated === true` in their `enabled` condition.
- [x] **Header Search Button Guard**: Update `Header` search input/button trigger to only present `CommandPalette` when `isAuthenticated === true`.

### Non-Functional Requirements
- **Security & Clean Architecture**: Zero unauthorized API requests dispatched from unauthenticated pages.
- **Type Safety**: Full TypeScript compliance (`tsc --noEmit` pass with 0 errors).
- **UX Consistency**: No floating dialogs or broken navigation options visible on auth screens.

### Out of Scope
- Guest/Public search functionality (Command Palette is strictly an in-app authenticated utility).

---

## 3. UI/UX Specifications (Frontend)

- **Auth Page Integrity**: Public auth pages (`/login`, `/register`) remain clean, focused solely on authentication, without keyboard shortcut overlays or unauthorized toasts.
- **Auto-Dismissal**: Smooth transition if session expires while palette is open.

---

## 4. Architecture & Technical Contracts

### Frontend (Next.js App Router & Zustand Auth Store)

1. **`useCommandPaletteListener` (`use-command-palette-listener.ts`)**:
   - Access `isAuthenticated` from `useAuthStore((state) => state.isAuthenticated)`.
   - Access `pathname` from `usePathname()`.
   - Add `useEffect` hook to auto-dismiss palette when `!isAuthenticated` or when `pathname` matches auth routes (`/login`, `/register`, `/forgot-password`, `/reset-password`).
   - In `useKeyPress('k', ...)` handler: return early if `!isAuthenticated || isAuthRoute`.

2. **`CommandPalette` (`command-palette.tsx`)**:
   - Add `enabled: Boolean(isOpen) && isAuthenticated` to `useVocabularyFolders`.
   - Add `enabled: Boolean(isOpen) && Boolean(folder.id) && isAuthenticated` to `topicQueries`.
   - Add `enabled: Boolean(isOpen) && debouncedSearch.trim().length > 0 && isAuthenticated` to `vocabWords`.

3. **`Header` (`header.tsx`)**:
   - Verify search bar trigger checks `isAuthenticated`.

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `frontend/apps/web/src/shared/components/providers/updater/hooks/use-command-palette-listener.ts` | Add auth check & route guard to `useKeyPress` and auto-dismiss on unauthenticated routes |
| `[MODIFY]` | `frontend/apps/web/src/shared/components/command-palette.tsx` | Enforce `isAuthenticated` guard on all query hooks and auto-dismiss guard |

---

## 6. Implementation & Quality Verification Checklist

- [x] `tsc --noEmit` passes with 0 errors in `frontend/apps/web`.
- [x] Pressing `Ctrl + K` on `/login` or `/register` does nothing.
- [x] No `401 Unauthorized` API calls dispatched from `/login`.
- [x] Authenticated users on protected pages can open and use `Ctrl + K` normally.

---

## 7. Risks & Technical Considerations

- Ensure `usePathname` is called safely inside client component hooks.
