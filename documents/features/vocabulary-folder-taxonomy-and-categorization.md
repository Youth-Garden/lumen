# Feature Plan: Vocabulary Folder Taxonomy & Categorization

> **Status**: Completed
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-25
> **Target Module**: `backend/src/contexts/vocabulary` & `frontend/apps/web/src/features/vocabulary`

---

## 1. Overview & Objectives

### Problem Statement
Currently, vocabulary seed folders in Lumen have heterogeneous `category` values where several folders share a category name identical to their folder name (e.g. "Tiếng Anh giao tiếp", "Tiếng Anh học thuật", "Tiếng Anh thương mại"). This creates visual fragmentation in the UI, where multiple categories contain only a single isolated card.

Conversely, grouping all exam and certification packs into one single huge umbrella category is overly coarse and fails to reflect standard language learning platform architecture (such as Lingoland, Quizlet, or Memrise).

### Objectives
1. Define a clean, balanced, and modular taxonomy for English vocabulary packs in Lumen.
2. Group the current 7 seeded datasets into intuitive, balanced categories (2–3 folders per category) without visual clutter.
3. Establish a standard taxonomy roadmap to seamlessly accommodate future packs (IELTS, SAT, TOEFL, Oxford 3000/5000, Phrasal Verbs, Idioms, K-12) without schema changes.

---

## 2. Requirements & Scope

### Functional Requirements
- [x] **Uniform `I18nString` Categorization**: Every system folder must have a bilingual category `{ en: string, vi: string }`.
- [x] **Current 7 Datasets Categorization**:
  1. **Category: `Từ vựng TOEIC` / `TOEIC Vocabulary`**:
     - `600 từ vựng TOEIC cốt lõi` (608 Words)
     - `Từ vựng TOEIC nâng cao` (1,200 Words)
  2. **Category: `Tiếng Anh Giao tiếp` / `Communication & Spoken English`**:
     - `Tiếng Anh giao tiếp` (NGSL Core 2,807 Words)
     - `Tiếng Anh đàm thoại` (NGSL Spoken 719 Words)
  3. **Category: `Tiếng Anh Chuyên ngành` / `ESP & Academic English`**:
     - `Tiếng Anh thương mại` (NGSL Business 1,744 Words)
     - `Tiếng Anh học thuật` (NGSL Academic 957 Words)
  4. **Category: `Từ vựng Thông dụng & Nền tảng` / `Core & Foundational English`**:
     - `Tiếng Anh nền tảng` (Foundational 275 Words)
     - *(Ready for upcoming packs: Oxford 3000, Oxford 5000, 500 High-Frequency Nouns/Verbs)*
- [x] **Dedicated Exam Categorization for Future Expansions**:
  - `Từ vựng IELTS` / `IELTS Vocabulary`
  - `Từ vựng SAT` / `SAT Vocabulary`
  - `Từ vựng TOEFL` / `TOEFL Vocabulary`
  - `Cụm từ & Thành ngữ` / `Phrases, Idioms & Collocations`

### Non-Functional Requirements
- **Performance**: Zero overhead; folders are queried with existing indexed `folder.category` field.
- **Zero UI Breaking Changes**: Frontend already dynamically groups folders by `category` and renders responsive grid layouts.

---

## 3. UI/UX Specifications (Frontend)

- **Balanced Grid Layout**: Each category row renders 2 to 4 compact folder cards (`CurrentLearningFolderCard`), eliminating isolated single-card sections.
- **Dynamic Localization**: Categories render through `i18nText(folder.category, locale)` supporting instant language switching between English and Vietnamese.
- **Clean Aesthetic**: Adheres to Lumen's flat, airy design language with zero unnecessary badge clutter next to section headers.

---

## 4. Architecture & Technical Contracts

### Backend (`vocab_folders`)
- Entity field: `category: I18nString | null`
- Seeder configurations in `ngsl-datasets.config.ts` and `seed-toeic.ts` provide exact standard `{ en: string, vi: string }` category objects.
- Update script modifies current live DB rows to match the taxonomy.

### Taxonomy Matrix

| Category (VI / EN) | Folder Name (VI) | Word Count | Topics Count |
| :--- | :--- | :--- | :--- |
| **Từ vựng TOEIC**<br/>*(TOEIC Vocabulary)* | 600 từ vựng TOEIC cốt lõi<br/>Từ vựng TOEIC nâng cao | 608<br/>1,200 | 50<br/>16 |
| **Tiếng Anh Giao tiếp**<br/>*(Communication English)* | Tiếng Anh giao tiếp<br/>Tiếng Anh đàm thoại | 2,807<br/>719 | 36<br/>10 |
| **Tiếng Anh Chuyên ngành**<br/>*(ESP & Academic English)* | Tiếng Anh thương mại<br/>Tiếng Anh học thuật | 1,744<br/>957 | 24<br/>12 |
| **Từ vựng Thông dụng & Nền tảng**<br/>*(Core & Foundational English)* | Tiếng Anh nền tảng | 275 | 4 |

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `backend/src/contexts/vocabulary/infrastructure/seed/ngsl-datasets.config.ts` | Update standard category definitions for NGSL datasets |
| `[MODIFY]` | `backend/src/contexts/vocabulary/infrastructure/seed/seed-toeic.ts` | Ensure uniform TOEIC category definition |
| `[COMPLETED]` | `backend/src/sync-folder-categories.js` | Executed database update for active system folders |

---

## 6. Implementation & Quality Verification Checklist

- [x] `ngsl-datasets.config.ts` categories updated with balanced taxonomy.
- [x] Database synchronization script executed against Neon PostgreSQL.
- [x] Backend build check `pnpm exec tsc --noEmit` passes with 0 errors.
- [x] Frontend build check `pnpm --filter web exec tsc --noEmit` passes with 0 errors.
- [x] Verify category titles in UI render cleanly in both English and Vietnamese.

---

## 7. Risks & Technical Considerations

- **Data Consistency**: Updating folder categories only modifies metadata on `vocab_folders` rows and does not affect flashcards, user progresses, SRS intervals, or word relationships.
