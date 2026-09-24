# Feature Plan: Service Mapper & Dynamic I18n String Resolver Architecture

> **Status**: SUPERSEDED (Unified and superseded by [generic-i18n-resolver-unification.md](./generic-i18n-resolver-unification.md))
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-24
> **Target Module**: `frontend/apps/web/src/shared/utils`, `services/core`, `services/vocabulary`

---

## 1. Overview & Objectives

This feature establishes a centralized Service Data Mapper and UI Localization Resolver pipeline (`vocabulary.mappers.ts` & `i18n-resolver.ts`) in compliance with Lumen's Clean Architecture & Separation of Concerns rules.

### Key Objectives:
1. **Unified Enum Locale & Zero Redundant Types (`shared/types/i18n.ts`)**:
   - Converted `Locale` into a central `enum Locale { EN = 'en', VI = 'vi' }`.
   - Completely eliminated redundant alias types (removed `SupportedLocale`).
2. **Service Layer Data Normalization (`services/vocabulary/vocabulary.mappers.ts`)**:
   - Enhance `wordMapper` in the Service Layer to parse raw HTTP responses (`definition: { en, vi }` or flat fields) into clean, predictable domain properties (`definitionEn`, `translationVi`, `definition`).
   - Eliminate leaky inline checks in UI components.
3. **Dynamic UI Localized String Resolver (`shared/utils/i18n-resolver.ts`)**:
   - Create clean helper functions (`resolveI18nString` and `resolveDefinitionMeaning`) without `.utils` file suffix.
   - Use `switch (locale)` branching logic to easily support future language additions.
4. **Locale-Aware Word Review in Study Completed (`study-completed.tsx`)**:
   - Ensure `StudyCompleted` renders English definition meanings when active UI locale is set to English (`'en'`), and Vietnamese when set to Vietnamese (`'vi'`).
5. **Enhanced Visual Design for Completed & Frozen Streak Days**:
   - Replace generic checkmark icons on completed streak days with 3D `<StreakIcon size={24} />`.
   - Scale up `<StreakIcon>` and `<StreakFreezeIcon>` sizes in day capsules for maximum visual impact.

---

## 2. Requirements & Scope

### Functional Requirements
- [x] **Type Normalization (`shared/types/i18n.ts`)**:
  - Define `Locale` as `enum Locale { EN = 'en', VI = 'vi' }`.
  - Remove redundant `SupportedLocale` type alias.
- [x] **Service Layer Mapper Upgrade (`services/vocabulary/vocabulary.mappers.ts`)**:
  - Standardize `wordMapper` definition mapping logic so `definitionEn` and `translationVi` are always cleanly populated from raw API DTOs.
- [x] **Shared I18n Resolver (`shared/utils/i18n-resolver.ts`)**:
  - Implement `resolveI18nString(input, locale, fallback)` with `switch (locale)`.
  - Implement `resolveDefinitionMeaning(definition, locale)` with `switch (locale)`.
- [x] **Study Completed Component (`study-completed.tsx`)**:
  - Replace inline `def?.translationVi || def?.definitionEn` with `resolveDefinitionMeaning(def, locale)`.
  - Render 3D `<StreakIcon size={24} />` for completed days and `<StreakFreezeIcon size={24} />` for frozen days.

### Non-Functional Requirements
- **Clean Architecture & Zero Leaks**: Services handle data normalization; UI components handle presentation rendering.
- **Type Safety**: 0 `any` types; strictly typed inputs.

---

## 3. Architecture & Data Flow

```
+-------------------------------------------------------------+
|              Backend API Raw DTO Response                   |
| { definitions: [{ definition: { en: "basis", vi: "cơ sở" }}]} |
+-------------------------------------------------------------+
                              |
                              v  (Service Layer Mapper)
+-------------------------------------------------------------+
|           `wordMapper` in `vocabulary.mappers.ts`           |
| - Normalizes into: `definitionEn` & `translationVi`         |
+-------------------------------------------------------------+
                              |
                              v  (UI Presentation Layer)
+-------------------------------------------------------------+
|    `resolveDefinitionMeaning(def, activeLocale)` (switch)   |
| - locale === Locale.EN -> renders `definitionEn`            |
| - locale === Locale.VI -> renders `translationVi`          |
+-------------------------------------------------------------+
```

---

## 4. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `frontend/apps/web/src/shared/types/i18n.ts` | Converted `Locale` to enum, removed redundant `SupportedLocale` |
| `[MODIFY]` | `frontend/apps/web/src/shared/i18n/routing.ts` | Updated routing to use `Locale` enum |
| `[MODIFY]` | `frontend/apps/web/src/services/vocabulary/vocabulary.types.ts` | Cleaned up imports and exports |
| `[NEW]` | `frontend/apps/web/src/shared/utils/i18n-resolver.ts` | Clean resolver helpers using `switch (locale)` |
| `[DELETE]` | `frontend/apps/web/src/shared/utils/i18n-resolver.utils.ts` | Deleted old `.utils` file |
| `[MODIFY]` | `frontend/apps/web/src/shared/utils/index.ts` | Re-exported `i18n-resolver` |
| `[MODIFY]` | `frontend/apps/web/src/features/study/components/study-completed.tsx` | Used 3D StreakIcon & resolveDefinitionMeaning for localized meanings |

---

## 5. Implementation & Quality Verification Checklist

- [x] Frontend typecheck passes with 0 errors (`cmd /c npx tsc --noEmit` in `frontend/apps/web`).
- [x] Active locale `'en'` renders English definition meanings (`definitionEn`).
- [x] Active locale `'vi'` renders Vietnamese definition meanings (`translationVi`).
- [x] Completed streak days display 3D `<StreakIcon size={24} />`.
- [x] Frozen streak days display 3D `<StreakFreezeIcon size={24} />`.
