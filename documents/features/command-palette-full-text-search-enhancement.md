# Feature Plan: Command Palette Comprehensive Search Enhancement

> **Status**: Approved
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-25
> **Target Module**: `frontend/apps/web/src/shared/components/command-palette.tsx`

---

## 1. Overview & Objectives

The Command Palette (`Ctrl + K` search modal) was previously limited to basic folder and master word queries, lacking support for sub-topics, navigation tabs/pages, and direct interactive word detail triggers.

This enhancement expands the Command Palette into a comprehensive, multi-domain search engine supporting:
1. **Navigation Pages & Main Tabs** (Dashboard, Decks, Due Reviews, TOEIC, Dictation, Reading, Speaking, Grammar, Settings).
2. **System & Custom Folders** (Full-text query against folder names, descriptions, and categories).
3. **Sub-Topics across System Decks** (Live search across sub-topics e.g. "Contracts", "Marketing", "Travel", "Greeting", "Kinh doanh" with parent folder context badges).
4. **Master Vocabulary Words** (Instant term search with CEFR level badges and direct trigger of the interactive `WordDetailSheet` modal).
5. **Quick Actions** (Account Profile, Settings, and Logout).

---

## 2. Requirements & Scope

### Functional Requirements
- [x] **Navigation Tab Search**: Filter main application routes in both English & Vietnamese.
- [x] **Sub-Topic Search**: Query sub-topics across system decks with parent folder context and total word counts.
- [x] **Folder Search**: Multi-field matching against name, description, and category.
- [x] **Interactive Word Sheet**: Selecting a word opens `WordDetailSheet` directly with audio, definitions, and examples instead of broken routes.
- [x] **Zero Layout Shift**: Debounced queries and clean grouping with i18n highlight text.

### Non-Functional Requirements
- Type safety with strict `I18nString` resolvers (`i18nText`, `includesI18n`).
- Custom hook & component line limit compliance (<= 300 lines).
- Seamless integration with TanStack Query caching for topic lists (`staleTime: 5 min`).

---

## 3. UI/UX Specifications

- **Group Headers**: Categorized results into `Suggestions / Pages`, `Folders`, `Topics`, `Vocabulary Words`, and `Quick Actions`.
- **Badges**: Primary accent chips for Categories & CEFR levels, subtle badges for parent folder names.
- **Portals**: Clean integration with `@lumen/uikit/portal` for `WordDetailSheet`.

---

## 4. Architecture & File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[NEW]` | `documents/features/command-palette-full-text-search-enhancement.md` | BA Feature Spec Document |
| `[MODIFY]` | `frontend/apps/web/src/shared/components/command-palette.tsx` | Comprehensive Search Implementation |
| `[MODIFY]` | `frontend/apps/web/src/shared/i18n/messages/vi.json` | i18n Command Palette copy |
| `[MODIFY]` | `frontend/apps/web/src/shared/i18n/messages/en.json` | i18n Command Palette copy |

---

## 5. Implementation Verification Checklist

- [x] Frontend `tsc --noEmit` build passes with 0 errors.
- [x] Clean `I18nString` access without raw property indexing.
- [x] Navigation tabs, topics, folders, and vocabulary words verified.
