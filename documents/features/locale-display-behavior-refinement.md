# Feature Plan: Locale-Aware Content Display Refinement

> **Status**: Completed
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-29
> **Target Module**: `frontend/apps/web/src/shared/utils/i18n.ts`, `frontend/apps/web/src/features/vocabulary/...`

---

## 1. Overview & Objectives

Refine the dynamic multilingual content resolution (`i18nText` & `getSecondaryI18nText`) and UI component rendering logic across the Lumen frontend.

### Problem
When the user sets their UI language (`locale`) to English (`en`), definition sheets, vocabulary list cards, and study flashcards currently display both English and Vietnamese translations simultaneously (e.g., showing Vietnamese translation lines under English definitions and example sentences).

### Solution
- When `locale === Locale.EN`, secondary translation lines (e.g. Vietnamese) MUST NOT be displayed. The interface should cleanly display English target content only.
- When `locale === Locale.VI`, the interface displays primary Vietnamese translations alongside optional secondary English reference text.
- Maintain a **100% locale-agnostic architecture** so that future UI languages (e.g. Japanese `ja`, Korean `ko`) will seamlessly display their respective translations without hardcoding language swaps.

---

## 2. Requirements & Scope

### Functional Requirements

1. **`getSecondaryI18nText(input, currentLocale)` Helper Behavior**:
   - For `currentLocale === Locale.EN`: return `''` (empty string). An English UI user studying English content does not require secondary translations in other languages.
   - For `currentLocale === Locale.VI`: return `input[Locale.EN] || ''` (returns target English original text as secondary reference if primary is Vietnamese).
   - For future locales (e.g. `Locale.JA`): return `input[Locale.EN] || ''` (returns target English original text as secondary reference if primary is Japanese).

2. **Word Detail Sheet (`word-detail-sheet.tsx`)**:
   - **Definitions**:
     - `primaryText = i18nText(def.definition, locale)`
     - `secondaryText = getSecondaryI18nText(def.definition, locale)`
     - Render secondary definition line ONLY IF `secondaryText` is non-empty and distinct from `primaryText`.
   - **Example Sentences**:
     - Primary target sentence: `sentenceEn = i18nText(example.sentence, Locale.EN)`
     - Native translation sentence: `sentenceNative = i18nText(example.sentence, locale)`
     - Render native translation line below English example ONLY IF `locale !== Locale.EN` AND `sentenceNative` is non-empty and non-identical to `sentenceEn`.

3. **Vocabulary List Page (`vocabulary-list-page.tsx`)**:
   - `primaryMeaning = i18nText(def.definition, locale)`
   - `secondaryMeaning = getSecondaryI18nText(def.definition, locale)`
   - Render `({secondaryMeaning})` ONLY IF `secondaryMeaning` is non-empty and distinct from `primaryMeaning`.

4. **Flashcard Review Component (`flashcard-review.tsx`)**:
   - `primaryMeaning = i18nText(def.definition, locale)`
   - `secondaryMeaning = getSecondaryI18nText(def.definition, locale)`
   - Render secondary meaning block ONLY IF `secondaryMeaning` is non-empty and distinct from `primaryMeaning`.

### Non-Functional Requirements
- **100% Multilingual Scalability**: Zero hardcoded language swap conditionals (`locale === 'en' ? 'vi' : 'en'`).
- **Type Safety**: Strictly consume `Locale` enum (`Locale.EN`, `Locale.VI`, etc.).
- **Zero Visual Regression**: Preserves layout integrity when secondary lines are omitted.

---

## 3. UI/UX Specifications (Frontend)

- **Clean Single-Language Mode (EN)**: In English locale, card definitions and example sentences present clean, minimalist typography without redundant translation clutter.
- **Multilingual Support (VI / Future Locales)**: In non-English locales, the target language sentence remains highlighted while native language translations are displayed underneath in muted secondary text (`text-muted-foreground`).

---

## 4. Technical Architecture & Contracts

```
               +--------------------------------------+
               |    User Interface Locale (useLocale)  |
               +------------------+-------------------+
                                  |
               +------------------v-------------------+
               |  i18n Utilities (shared/utils/i18n)  |
               +--------+--------------------+--------+
                        |                    |
       locale === EN    |                    |   locale === VI (or JA/KO...)
                        v                    v
      +-------------------+                +--------------------+
      |  i18nText:        |                |  i18nText:         |
      |   input['en']     |                |   input['vi']      |
      |  getSecondary:    |                |  getSecondary:     |
      |   "" (empty)      |                |   input['en']      |
      +-------------------+                +--------------------+
                        |                    |
                        v                    v
      +-------------------+                +--------------------+
      |  UI Output:       |                |  UI Output:        |
      |  English Only     |                |  Primary VI +      |
      |  (No VI translation)               |  Secondary EN      |
      +-------------------+                +--------------------+
```

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `frontend/apps/web/src/shared/utils/i18n.ts` | Update `getSecondaryI18nText` to return `''` for `Locale.EN` |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/components/folder-detail/word-detail-sheet.tsx` | Conditionally hide native example sentence when `locale === Locale.EN` |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/pages/vocabulary-list-page.tsx` | Ensure secondary meaning is hidden when `getSecondaryI18nText` returns empty string |
| `[MODIFY]` | `frontend/apps/web/src/features/study/components/flashcard-review.tsx` | Ensure secondary meaning block is hidden when `getSecondaryI18nText` returns empty string |
| `[MODIFY]` | `frontend/apps/web/src/shared/utils/__tests__/i18n.spec.ts` | Update unit tests for `getSecondaryI18nText` helper |

---

## 6. Implementation & Quality Verification Checklist

- [ ] `getSecondaryI18nText(dict, Locale.EN)` returns `''`.
- [ ] `getSecondaryI18nText(dict, Locale.VI)` returns `input[Locale.EN] || ''`.
- [ ] Word detail modal displays ONLY English definitions and sentences when locale is `en`.
- [ ] Word detail modal displays Vietnamese translation lines when locale is `vi`.
- [ ] Vocabulary list page cards do not show `(...)` secondary translations when locale is `en`.
- [ ] Study flashcard review cards do not show secondary translation lines when locale is `en`.
- [ ] Frontend type check passes: `pnpm --filter web exec tsc --noEmit`.
- [ ] i18n unit tests pass cleanly: `pnpm test`.

---

## 7. Risks & Technical Considerations

- **Existing Unit Tests**: `frontend/apps/web/src/shared/utils/__tests__/i18n.spec.ts` previously asserted `getSecondaryI18nText(dict, Locale.EN)` returned `'Xin chào'`. This test assertion will be updated to expect `''` to reflect the refined behavior.
