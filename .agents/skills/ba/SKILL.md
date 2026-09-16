---
name: ba
description: Workflow and standardized format for feature planning, business requirements analysis, saving feature plan documents under documents/features/, and tracking implementation checklists in Lumen.
---

# Business Analyst & Feature Planning Skill — Lumen

This skill defines the mandatory workflow and standardized format for feature planning, business analysis, documenting, and tracking features in the Lumen codebase.

## 1. Overview & Core Rules

- **Source of Truth**: Every new feature or major technical enhancement MUST have a dedicated feature document saved in `documents/features/[feature-name].md`.
- **Pre-Implementation Requirement**: Before writing or modifying source code for a non-trivial feature, create or update the corresponding feature plan.
- **Living Document**: Update the status and checklist in `documents/features/[feature-name].md` as work progresses until completion.

---

## 2. Standardized Feature Document Template

Every file in `documents/features/[feature-name].md` MUST strictly follow this markdown template:

```markdown
# Feature Plan: [Feature Name]

> **Status**: [Draft | In Review | Approved | In Progress | Completed]
> **Author**: Antigravity Pair Programmer / BA
> **Date**: YYYY-MM-DD
> **Target Module**: [backend/src/modules/... | frontend/src/features/...]

---

## 1. Overview & Objectives

Briefly describe the purpose of the feature, the problem it solves, and the business/user value.

---

## 2. Requirements & Scope

### Functional Requirements
- [ ] Requirement 1
- [ ] Requirement 2

### Non-Functional Requirements
- Performance (e.g. response time, indexed database queries)
- Type safety (no `any`, strict mapper validation)
- UI/UX compliance (Design System, accessibility, responsive layout)

### Out of Scope
- Items explicitly excluded from this iteration.

---

## 3. UI/UX Specifications (Frontend)

- **Design System Alignment**: Standard HSL tokens, flat modern aesthetic, no manual button re-styling.
- **Anti-Box-in-Box**: Native background surfaces with natural spacing (no cramped nested card boxes).
- **Base UI Triggers**: Use `render={<Element />}` prop for `@lumen/uikit` triggers.
- **Z-Index Layering**: Standard 98 (background portals) / 99 (backdrop) / 100 (top active portal).
- **i18n Localization**: All UI copy stored in `messages/{locale}.json` with `camelCase` keys.

---

## 4. Architecture & Technical Contracts

### Backend (NestJS DDD Monolith)
- **Bounded Context**: [Vocabulary | Study | IAM | Progress | etc.]
- **CQRS Handler**: Commands / Queries to implement.
- **DTO Validation**: Class-Transformer `@Transform` for query parameters (e.g. `ListDueFlashcardsDto`).
- **Database Schema**: TypeORM entities, indexed fields (e.g. `@Index('idx_user_progress_due', ['userId', 'nextReviewAt'])`).

### Frontend (Next.js App Router)
- **Service Layer**: Direct parameter passing in `BaseApiService._get(url, params)`.
- **State Management**: TanStack Query hooks, Zustand UI state.
- **Hook Line Limit**: Custom hooks MUST be <= 300 lines (extract pure utility functions to `utils/`).

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[NEW]` | `backend/src/...` | Command / DTO creation |
| `[MODIFY]` | `frontend/src/...` | UI component update |

---

## 6. Implementation & Quality Verification Checklist

- [ ] Backend build check: `tsc --noEmit` or build check in `backend/` passes with 0 errors.
- [ ] Frontend build check: `tsc --noEmit` or build check in `frontend/` passes with 0 errors.
- [ ] No `any` type bypasses (use `Record<string, unknown>` or explicit narrowing).
- [ ] No manual re-styling of `<Button>` components.
- [ ] All custom React hooks <= 300 lines of code.
- [ ] Clean domain separation between `vocabulary`, `study`, `progress`, etc.
- [ ] No hardcoded UI text strings or emojis used as icons.

---

## 7. Risks & Technical Considerations

Highlight potential edge cases, breaking changes, or risks.
```

---

## 3. Workflow & Usage Instructions

1. **Creating a Plan**:
   - Create `documents/features/[feature-name].md` using the template above.
   - Fill out sections 1 through 7 before starting implementation.
2. **Executing the Plan**:
   - Follow the File Change Matrix step-by-step.
   - Keep custom hooks <= 300 lines by placing data logic in pure utility functions in `utils/`.
3. **Verifying & Completing**:
   - Run type checks and build scripts in `backend` and `frontend`.
   - Mark all checklist items as completed `[x]`.
   - Change `Status` to `Completed`.
