# Feature Plan: Universal Multilingual Standard & Generic i18n Architecture

> **Status**: Completed
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-24
> **Target Module**: `frontend/apps/web/src/shared/utils`, `services/core`, `services/vocabulary`, and all UI feature consumers

---

## 1. Overview & Objectives

Eliminate fragmented language properties, ad-hoc wrapper functions, and two-language hardcoding across the Lumen platform:
- Purge all legacy fields (`definitionEn`, `translationVi`, `sentenceEn`, `topicVi`, `name` + `viName`).
- Establish a future-proof, generic dynamic multilingual schema (`I18nString` = `Partial<Record<Locale, string>> & Record<string, string>`) supporting any number of current and future locales (`en`, `vi`, `ja`, `ko`, `zh`, etc.).
- Centralize all data ingestion into a universal mapper (`toI18nString` in `services/core/core.mappers.ts`).
### 3.1 Universal Text Resolvers & Query Search (`@/shared/utils/i18n.ts`)

```typescript
import { Locale } from '@/shared/types';
import type { I18nString } from '@/shared/types';

export function i18nText(
  input: I18nString | null | undefined,
  locale: Locale = Locale.EN,
): string {
  if (!input) return '';

  switch (locale) {
    case Locale.VI:
      return input[Locale.VI] || input[Locale.EN] || '';
    case Locale.EN:
    default:
      return input[Locale.EN] || input[Locale.VI] || '';
  }
}

export function getSecondaryI18nText(
  input: I18nString | null | undefined,
  currentLocale: Locale = Locale.EN,
): string {
  if (!input) return '';

  switch (currentLocale) {
    case Locale.VI:
      return input[Locale.EN] || '';
    case Locale.EN:
    default:
      return input[Locale.VI] || '';
  }
}

export function includesI18n(
  input: I18nString | null | undefined,
  query: string,
): boolean {
  if (!input || !query) return false;
  const normalizedQuery = query.toLowerCase().trim();
  return Object.values(input).some((val) =>
    val?.toLowerCase().includes(normalizedQuery),
  );
}
```

### 3.2 Core Service Mapper (`@/services/core/core.mappers.ts`)

```typescript
import type { I18nString } from '@/shared/types';

export const toI18nString = (raw: unknown): I18nString => {
  if (raw && typeof raw === 'object') {
    return raw as I18nString;
  }
  return {};
};
```

### 3.3 Strongly Typed Active Locale Hook (`@/shared/hooks/use-app-locale.ts`)

```typescript
import { Locale } from '@/shared/types';
import { useLocale as useNextIntlLocale } from 'next-intl';

export function useLocale(): Locale {
  return useNextIntlLocale() as Locale;
}
```

---

## 4. Architectural Rules Enforced

1. **No Ad-Hoc / Derivative Helpers**: All files importing deprecated `folder-localization.utils.ts` and `word-localization.utils.ts` deleted and migrated to `i18nText`, `getSecondaryI18nText`, `matchesI18n`, and `includesI18n`.
2. **Dynamic User Native Language Checking**: Always check active `locale` from `useLocale()`. Never write hardcoded Vietnamese/English ternaries (e.g. `{locale === Locale.VI ? 'Tiếp tục' : 'Finish'}`). All static copy MUST reside in `messages/{locale}.json` and be rendered via `t('key')` or `t.rich('key', ...)`.
3. **Generic Multilingual Scalability**: For multilingual data objects, lookups inspect all keys dynamically via `matchesI18n(item.topic, topicName)` and `includesI18n(folder.name, query)`. Secondary sentences are rendered dynamically via `locale !== Locale.EN ? i18nText(example.sentence, locale) : null`.
4. **Locale Enum Strictness**: All calls use `Locale.EN`, `Locale.VI`, or active `locale` from `useLocale()`. No loose union types `Locale | string`.
5. **Clean Central Re-exports**: All types, keys, and services re-exported cleanly from their respective domain root `index.ts`.
6. **Elimination of Redundant Aliases & Empty Fallbacks**: Eliminated redundant type alias reassignments (`I18nMap`, `useAppLocale`). Kept definitions simple, clean, and direct.

---

## 5. Verification Checklist

- [x] Deleted `folder-localization.utils.ts`, `word-localization.utils.ts`, `folder-localization.utils.spec.ts`.
- [x] Replaced hardcoded Vietnamese JSX branches with `t.rich` and message keys in `study-completed.tsx`.
- [x] Implemented and integrated `matchesI18n` and `includesI18n` in `shared/utils/i18n.ts`.
- [x] Made topic lookup in `topic-detail-page.tsx` generic via `matchesI18n(item.topic, topicName)`.
- [x] Made folder filtering in `command-palette.tsx` generic via `includesI18n(folder.name, debouncedSearch)`.
- [x] Simplified `TopicWordsList` interface and removed deprecated `topicViName` prop.
- [x] Migrated all UI components to use typed `useLocale()` from `@/shared/hooks`.
- [x] Master rules in `.agents/AGENTS.md`, `.agents/skills/frontend/SKILL.md`, `.agents/skills/backend/SKILL.md`, `.agents/skills/ba/SKILL.md` updated.
- [x] Frontend test suite (`vitest run`): 34 test files, 139 tests passing (100%).
- [x] Production build (`next build` / `turbo build`): Compiled and optimized successfully with 0 errors.
