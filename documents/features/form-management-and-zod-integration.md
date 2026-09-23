# Feature Plan: Form Management and Zod Integration

> **Status**: In Review
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-22
> **Target Module**: `frontend/packages/uikit`, `frontend/apps/web`

---

## 1. Overview & Objectives

Provide a streamlined, type-safe form management utility (`useZodForm`) across the Lumen frontend codebase. This utility encapsulates React Hook Form and Zod resolver integration with default real-time validation (`mode: 'onChange'`), eliminating repetitive boilerplate across auth forms, dialogs, and settings while maintaining zero bundle overhead.

---

## 2. Requirements & Scope

### Functional Requirements
- [ ] Provide `useZodForm` hook supporting automatic schema inference via `z.infer<TSchema>`.
- [ ] Set `mode: 'onChange'` as the default validation strategy for immediate, responsive user feedback.
- [ ] Allow optional overrides for form configurations (`defaultValues`, `mode`, etc.).
- [ ] Refactor target auth and dialog forms to use the unified `useZodForm` hook.

### Non-Functional Requirements
- **Bundle Efficiency**: Zero new external dependencies; reuse existing `@hookform/resolvers/zod` and `react-hook-form`.
- **Strict Type-Safety**: 100% type inference without any `any` or loose casts.
- **Tree-Shaking**: Centralized export from `@lumen/uikit/components` ensuring pure modularity.

### Out of Scope
- Backend validation schema changes (backend DTOs remain untouched).

---

## 3. UI/UX Specifications (Frontend)

- Real-time field validation triggered on input change (`mode: 'onChange'`) rather than waiting for form submission.
- Error messages clear immediately when the user corrects an invalid input.
- Submit buttons remain responsive and state is synchronized with `formState.isValid` and `formState.isSubmitting`.

---

## 4. Architecture & Technical Contracts

### Hook Signature (`frontend/packages/uikit/src/components/ui/form.tsx` or dedicated hook file):
```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormProps, type UseFormReturn } from 'react-hook-form';
import type { z, ZodType } from 'zod';

export function useZodForm<TSchema extends ZodType<any, any, any>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>,
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    ...options,
  });
}
```

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `frontend/packages/uikit/src/components/ui/form.tsx` | Implement & export `useZodForm` helper |
| `[MODIFY]` | `frontend/packages/uikit/src/components/index.ts` | Re-export `useZodForm` |
| `[MODIFY]` | `frontend/apps/web/src/features/auth/pages/login-page.tsx` | Refactor to use `useZodForm` |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/components/dialogs/create-folder-dialog.tsx` | Refactor to use `useZodForm` |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/components/dialogs/add-flashcard-dialog.tsx` | Refactor to use `useZodForm` |

---

## 6. Implementation & Quality Verification Checklist

- [x] Frontend build check: `tsc --noEmit` passes with 0 errors across all workspaces.
- [x] ESLint check: `pnpm run lint` passes with 0 errors.
- [x] Verification of real-time validation on typing in auth and dialog forms.
- [x] No regression on form submission or token retrieval.

---

## 7. Risks & Technical Considerations

- `mode: 'onChange'` triggers re-renders on every keystroke in controlled inputs; this is standard and lightweight for small/medium forms like auth and dialogs, with no noticeable performance impact.

