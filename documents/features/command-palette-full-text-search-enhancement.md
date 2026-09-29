# Feature Plan: Command Palette Full-Text Search & UI Refinement

> **Status**: Completed
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-27
> **Target Module**: `frontend/packages/uikit/src/components/ui/command.tsx` & `frontend/apps/web/src/shared/components/command-palette.tsx`

---

## 1. Overview & Objectives

Refine the Command Palette (`CommandPalette` & UIKit `Command` components) to fix search results visibility, row hover styling, height expansion, and destructive action formatting:
1. **Disable `cmdk` In-Memory Filtering (`shouldFilter={false}`)**: Ensure custom search logic (Vocabulary Words API, Folder topics, System Folders, Nav pages, Quick actions) displays all matching items without being hidden by `cmdk`'s internal filter.
2. **Remove Unwanted Row Hover Borders**: Eliminate `border-primary/20` on `<CommandItem>` hover/selection. Match the clean, soft background hover style of `DropdownMenuItem` (`data-[selected=true]:bg-muted/70` or `data-[selected=true]:bg-accent`).
3. **Destructive Action Styling for Logout**: Add `variant="destructive"` support to `<CommandItem>` so the Logout action displays with soft red text (`text-destructive`) and red hover background (`hover:bg-destructive/10 text-destructive font-medium`).
4. **Smooth Height Expansion (`max-h-[80vh]`)**: Update `<CommandList>` and dialog container to smoothly animate and expand up to `80vh` when results are returned.

---

## 2. Requirements & Scope

### Functional Requirements
- Set `shouldFilter={false}` on `CommandPrimitive` inside `Command` / `CommandDialog` so custom filtering handles item visibility across all 5 search categories:
  1. Vocabulary Folders
  2. Sub-Topics
  3. Vocabulary Words (API `GET /vocabulary/words?search=...`)
  4. Pages & Features
  5. Quick Actions (Profile Settings, Logout)
- Update `<CommandItem>` in `@lumen/uikit/components/ui/command.tsx`:
  - Remove `border border-transparent` and `data-[selected=true]:border-primary/20`.
  - Implement `variant="default" | "destructive"` props.
  - Destructive variant renders `text-destructive data-[selected=true]:bg-destructive/10 data-[selected=true]:text-destructive`.
- Update `<CommandList>` max height to `max-h-[min(80vh,650px)]` with smooth `transition-all duration-300 ease-in-out`.

### Non-Functional Requirements
- **Design System Consistency**: Matches standard dropdown menu elevation, borderless rows, and destructive action styling.
- **Performance**: Instant search response using debounced queries without double-filtering bugs.
- **Type Safety**: Full TypeScript interfaces, 0 `any` bypasses.

---

## 3. UI/UX Specifications (Frontend)

- **CommandItem Default**: `relative flex cursor-pointer gap-2 select-none items-center rounded-xl px-3 py-2.5 text-sm outline-none transition-colors data-[selected=true]:bg-muted/70 text-foreground`
- **CommandItem Destructive (Logout)**: `data-[selected=true]:bg-rose-500/10 dark:data-[selected=true]:bg-rose-500/20 text-rose-500 dark:text-rose-400 font-medium`
- **Dialog & List Height**: `max-h-[min(80vh,650px)]` with smooth transition.

---

## 4. Architecture & Technical Contracts

- Component updated: `@lumen/uikit/src/components/ui/command.tsx`
- Component updated: `@/shared/components/command-palette.tsx`

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `frontend/packages/uikit/src/components/ui/command.tsx` | Remove row hover borders, add `variant="destructive"`, expand max height to `80vh`. |
| `[MODIFY]` | `frontend/apps/web/src/shared/components/command-palette.tsx` | Disable `cmdk` internal filter, apply `variant="destructive"` to Logout item. |

---

## 6. Implementation & Quality Verification Checklist

- [x] No borders on hover/selection of command items.
- [x] Searching any term (e.g., "p") returns vocabulary words, topics, folders, and pages.
- [x] Logout item has red text and soft red background on hover.
- [x] Dialog smoothly expands up to `80vh`.
- [x] `tsc --noEmit` passes with 0 errors.

---

## 7. Risks & Technical Considerations

- Ensure `CommandInput` focus is preserved when results update dynamically.
