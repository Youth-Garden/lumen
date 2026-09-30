# Feature Plan: Modal & Dialog Auto-Focus Management

> **Status**: In Review
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-29
> **Target Module**: `frontend/packages/uikit/src/components/ui/dialog.tsx` & `frontend/apps/web/src/features/**`

---

## 1. Overview & Objectives

Enhance accessibility and user interaction ergonomics across all modals, dialogs, command palettes, and sheets in Lumen by establishing a strict, deterministic **Auto-Focus Management Pattern**.

- **Search & Form Modals**: When a modal containing input fields (e.g. Command Palette search, Create Folder modal, Add Flashcard modal) is opened, focus automatically lands on the primary `<input>` / `<textarea>` element so the user can type immediately without manual clicking.
- **Informational & Confirmation Dialogs**: When an informational or confirmation modal (e.g. Activity Info "Got it", Delete Folder confirmation, Lesson Quota modal) is opened, focus automatically lands on the primary action button (e.g. "Got it" / "Confirm" / "Close") so the user can immediately execute or dismiss the action using keypress (`Space` / `Enter`).

---

## 2. Requirements & Scope

### Functional Requirements
- [ ] **Search & Form Auto-Focus**:
  - `CommandPalette`: Auto-focus search `<CommandInput autoFocus>`.
  - `CreateFolderDialog`: Auto-focus folder name `<Input autoFocus>`.
  - `AddFlashcardDialog`: Auto-focus word term `<Input autoFocus>`.
  - `DailyGoalDialog`: Auto-focus custom minutes input or primary save button.
- [ ] **Informational & Action Dialog Auto-Focus**:
  - `ActivityInfoDialog`: Auto-focus the "Got it" / "Close" `<Button autoFocus>`.
  - `ConfirmDeleteFolderDialog`: Auto-focus the primary action / cancel `<Button autoFocus>`.
  - `LessonQuotaDialog`: Auto-focus the primary "Save" / "Got it" `<Button autoFocus>`.
  - `PronunciationAccentDialog`: Auto-focus the "Save" `<Button autoFocus>`.
  - `StudyConfirmExitDialog`: Auto-focus the primary exit or resume `<Button autoFocus>`.
  - `KeyboardShortcutsDialog`: Auto-focus the "Close" `<Button autoFocus>`.
  - `MasteryFlowerDialog`: Auto-focus the "Close" `<Button autoFocus>`.
- [ ] **UIKit `DialogContent` Focus Handler**:
  - Enhance `@lumen/uikit` `DialogContent` to detect `[autoFocus]` elements upon portal mounting and trigger focus deterministically.

### Non-Functional Requirements
- **Accessibility**: Complies with WAI-ARIA Dialog (Modal) Patterns (focus trapping & initial focus placement).
- **Keyboard Usability**: Allows seamless keyboard-only navigation (`Tab`, `Space`, `Enter`, `Esc`).
- **Zero-Hydration Mismatches**: Focus resolution executes in client-side effects (`useEffect` / mount handlers).

### Out of Scope
- Modifying standard page routing navigation (focus strategy applies strictly to portals, modals, and sheets).

---

## 3. UI/UX Specifications (Frontend)

- **Design System Alignment**: Preserves existing UIKit `<Button>` variants (`default`, `secondary`, `outline`) and `<Input>` styles without local class overrides.
- **Focus Ring Indicator**: Native focus-visible rings (`focus-visible:ring-2 focus-visible:ring-primary/40`) rendered seamlessly when focused via keyboard.
- **i18n Compliance**: All button labels and placeholders consumed via `useTranslations` catalogs (`messages/{locale}.json`).

---

## 4. Architecture & Technical Contracts

### Frontend (`@lumen/uikit` & Next.js App Router)
- **Core Abstraction**: `@lumen/uikit/components/ui/dialog.tsx` `DialogContent` handles initial focus resolution using a lightweight client effect:
  ```typescript
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.querySelector('[data-slot="dialog-content"][data-state="open"]');
      if (container) {
        const autoFocusEl = container.querySelector<HTMLElement>(
          '[autoFocus], input:not([type="hidden"]), [data-autofocus]',
        );
        autoFocusEl?.focus();
      }
    }, 40);
    return () => clearTimeout(timer);
  }, []);
  ```
- **Declarative Props**: Dialog instances explicitly annotate target inputs and action buttons with standard `autoFocus` props.

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `frontend/packages/uikit/src/components/ui/dialog.tsx` | Add auto-focus resolution effect in `DialogContent` |
| `[MODIFY]` | `frontend/apps/web/src/features/dashboard/components/activity-info-dialog.tsx` | Add `autoFocus` to "Got it" / "Close" button |
| `[MODIFY]` | `frontend/apps/web/src/shared/components/command-palette.tsx` | Ensure `autoFocus` on search input |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/components/dialogs/create-folder-dialog.tsx` | Add `autoFocus` to folder name input |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/components/dialogs/add-flashcard-dialog.tsx` | Add `autoFocus` to term input |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/components/dialogs/confirm-delete-folder-dialog.tsx` | Add `autoFocus` to confirm button |
| `[MODIFY]` | `frontend/apps/web/src/features/dashboard/components/daily-goal-dialog.tsx` | Add `autoFocus` to save button |
| `[MODIFY]` | `frontend/apps/web/src/features/study/components/lesson-quota-dialog.tsx` | Add `autoFocus` to save button |
| `[MODIFY]` | `frontend/apps/web/src/features/study/components/pronunciation-accent-dialog.tsx` | Add `autoFocus` to save button |
| `[MODIFY]` | `frontend/apps/web/src/features/study/components/study-confirm-exit-dialog.tsx` | Add `autoFocus` to primary action button |
| `[MODIFY]` | `frontend/apps/web/src/features/study/components/keyboard-shortcuts-dialog.tsx` | Add `autoFocus` to close button |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/components/mastery/mastery-flower-dialog.tsx` | Add `autoFocus` to close button |

---

## 6. Implementation & Quality Verification Checklist

- [ ] Frontend type check: `pnpm --filter web exec tsc --noEmit` passes with 0 errors.
- [ ] Command Palette opens with cursor automatically placed inside the search input.
- [ ] Activity Info Dialog opens with focus automatically placed on the "Got it" button (pressing `Enter`/`Space` dismisses it immediately).
- [ ] Create Folder Dialog opens with cursor automatically placed inside the folder name input field.
- [ ] Confirmation and Settings Dialogs focus their primary action buttons upon opening.
- [ ] No `any` type bypasses or manual re-styling on `<Button>` components.

---

## 7. Risks & Technical Considerations

- **Browsers Auto-Focus Inconsistencies in Portals**: Handled cleanly via client `useEffect` resolution inside `DialogContent` so focus is placed reliably regardless of portal mounting timing.
