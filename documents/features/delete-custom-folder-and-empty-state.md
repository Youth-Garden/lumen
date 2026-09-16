# Feature Plan: Delete Custom Folder & Empty Folder Study Protection

> **Status**: In Review
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-16
> **Target Module**: `frontend/apps/web/src/features/vocabulary`

---

## 1. Overview & Objectives

Provide users with the ability to delete custom vocabulary folders they have created, and protect study actions against empty folders (0 words) by disabling study buttons and presenting a clear empty state with a call-to-action to add new words.

---

## 2. Requirements & Scope

### Functional Requirements
- [ ] **Delete Custom Folder API & Hook**: Integrate `DELETE /api/vocabulary/words/folders/:id` in `VocabularyService` and create `useDeleteFolder` mutation hook with query invalidation (`vocabularyKeys.folders()`, `vocabularyKeys.overview()`).
- [ ] **Delete Folder Confirmation Dialog**: Create `ConfirmDeleteFolderDialog` component using `usePortal` to prompt users before deleting a folder.
- [ ] **Delete Folder UI Integration**: Add a delete folder button in `FolderDetailPage` header and `FolderCard` menu.
- [ ] **Empty Folder View**: In `FolderDetailPage`, when a folder contains 0 flashcards, display an empty state illustration with message "Chưa có từ vựng nào trong thư mục này" and an "Thêm từ vựng" button.
- [ ] **Study Action Protection**: Disable the bottom study bar ("Học từ mới", "Luyện tập", "Thẻ ghi nhớ") when `flashcards.length === 0` to prevent launching empty study sessions.
- [ ] **i18n Translation**: Add translation keys for delete folder confirmation and empty folder messages in `vi.json` and `en.json`.

### Non-Functional Requirements
- **Type Safety**: Zero `any` type bypasses.
- **UI/UX Compliance**: Standard HSL tokens, flat modern aesthetic, clean design system compliance without manual button overrides.
- **Hook Line Limit**: Custom hooks <= 300 lines of code.

---

## 3. UI/UX Specifications (Frontend)

- **Design System Alignment**: Flat modern aesthetic using `@lumen/uikit` components and icons.
- **Delete Confirmation Dialog**: Clean dialog with Destructive action button ("Xóa thư mục").
- **Empty State**: Centered, spacious empty state container without cramped card clutter.
- **i18n Localization**: Keys added under `Vocabulary.Folders` namespace using `camelCase`.

---

## 4. Architecture & Technical Contracts

### Frontend (Next.js App Router)
- **Service Method**: `vocabularyService.deleteFolder(id: string)` via `this._delete(ApiEndpointEnum.VOCABULARY_FOLDER_DETAIL, undefined, { pathParams: { id } })`.
- **Mutation Hook**: `useDeleteFolder()` in `@/features/vocabulary/hooks/use-vocabulary.ts`.
- **Query Invalidation**: Invalidate `vocabularyKeys.folders()` and `vocabularyKeys.overview()` on deletion.

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `frontend/apps/web/src/services/vocabulary/vocabulary.service.ts` | Add `deleteFolder(id)` API method |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/hooks/use-vocabulary.ts` | Add `useDeleteFolder()` React Query mutation |
| `[NEW]` | `frontend/apps/web/src/features/vocabulary/components/dialogs/confirm-delete-folder-dialog.tsx` | Create confirmation dialog for deleting a folder |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/pages/folder-detail-page.tsx` | Add delete folder action, empty state UI, and study button disabling |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/components/cards/folder-card.tsx` | Add delete folder action to folder card |
| `[MODIFY]` | `frontend/apps/web/src/shared/i18n/messages/vi.json` | Add Vietnamese translation keys |
| `[MODIFY]` | `frontend/apps/web/src/shared/i18n/messages/en.json` | Add English translation keys |

---

## 6. Implementation & Quality Verification Checklist

- [ ] Frontend type check: `tsc --noEmit` in `frontend/` passes with 0 errors.
- [ ] No `any` type bypasses.
- [ ] No manual re-styling of `<Button>` components.
- [ ] All custom React hooks <= 300 lines of code.
- [ ] Clean domain separation between `vocabulary` and `study`.
- [ ] All UI strings localized in `vi.json` and `en.json`.

---

## 7. Risks & Technical Considerations

- **Redirect After Delete**: Navigating away from `FolderDetailPage` when deleting the currently viewed folder must redirect smoothly to `RouteEnum.VOCABULARY` without race conditions or missing ID crashes.
