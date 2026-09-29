# Feature Plan: Vocabulary Seeding & Data Enrichment Pipeline

> **Status**: Approved
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-27
> **Target Module**: `backend/src/scripts/` & `.agents/skills/seed-vocabulary/`

---

## 1. Overview & Objectives

Consolidate all vocabulary seeder and data enrichment scripts into dedicated `scripts/` directories (`backend/src/scripts/` and `.agents/skills/seed-vocabulary/scripts/`), and execute a 100% zero-workaround data enrichment pipeline to guarantee data completeness across all vocabulary terms in the Lumen platform.

Every vocabulary term in the database MUST have:
1. **Bilingual Definition**: `definition` JSONB with accurate English (`en`) and Vietnamese (`vi`) translations.
2. **Bilingual Example Sentence**: `vocab_examples` with non-duplicate English (`en`) and Vietnamese (`vi`) sentences.
3. **IPA Phonetics**: `phoneticUs`, `phoneticUk`, and `phonetic` (e.g. `/kənvˈeɪ/`, `/ˌɑːrkɪˈtɛktʃərəl/`).
4. **Audio URLs**: Direct `.mp3` sound URLs for US (`audioUsUrl`) and UK (`audioUkUrl`) from FreeDictionary API or Oxford/Cambridge CDN.
5. **Illustration Image**: Dynamic per-term image URL (`imageUrl`) fetched from Wikimedia Commons / Unsplash Search API (strictly 0 static fallback arrays).

---

## 2. File Organization & Architecture

```
backend/src/scripts/
├── seed-ngsl-vocabulary.ts          # Master seeder for NGSL/TSL/NAWL/BSL/NDL datasets
├── seed-toeic.ts                    # Master seeder for TOEIC 600 dataset
└── enrich-vocabulary-data.ts        # 100% Rich Data enrichment pipeline

.agents/skills/seed-vocabulary/scripts/
├── seed-ngsl-vocabulary.ts          # Runner linking to backend script
└── enrich-vocabulary-data.ts        # Runner linking to backend script
```

---

## 3. Implementation Tasks

### Task 1: Move & Consolidate Scripts into `scripts/` Folders
- **Action**: Create `backend/src/scripts/` and `.agents/skills/seed-vocabulary/scripts/`.
- **Files**:
  - Move `backend/src/seed-ngsl-vocabulary.ts` -> `backend/src/scripts/seed-ngsl-vocabulary.ts`
  - Move `backend/src/seed-toeic.ts` -> `backend/src/scripts/seed-toeic.ts`
  - Move `backend/src/enrich-vocabulary-data.ts` -> `backend/src/scripts/enrich-vocabulary-data.ts`
  - Clean up legacy root files (`backend/src/enrich-dictionary-definitions.ts`, `backend/src/enrich-vocabulary-data.ts`, `backend/src/seed-ngsl-vocabulary.ts`, `backend/src/seed-toeic.ts`).
  - Update `backend/package.json` script aliases (`seed:ngsl`, `seed:enrich`).
  - Update `.agents/skills/seed-vocabulary/SKILL.md` documentation.

### Task 2: Enhance Zero-Workaround Enrichment Script
- **Action**: Implement complete data fetchers in `backend/src/scripts/enrich-vocabulary-data.ts`:
  - **Images**: Query Wikimedia Commons Image Search per-term (`https://en.wikipedia.org/w/api.php?action=query&titles={term}&prop=pageimages`).
  - **Audio**: Query FreeDictionary API `phonetics[].audio` per-term, fallback to Oxford/Google TTS CDN.
  - **Phonetics**: Query FreeDictionary API `phonetics[].text`, fallback to Datamuse Arpabet-to-IPA.
  - **Definitions**: Datamuse / FreeDict English definition + MyMemory / Google Translate API for Vietnamese translation.
  - **Examples**: FreeDict / contextual English sentence + MyMemory / Google Translate API for Vietnamese translation, deduplicated per definition.
  - **Database Write**: Raw SQL queries using `safeQuery` to update `vocab_words`, `vocab_definitions`, `vocab_examples`.

### Task 3: Execute Full Seeding & Database Enrichment
- **Action**:
  1. Run `pnpm run seed:ngsl` in `backend` to ensure all datasets are preloaded.
  2. Run `pnpm run seed:enrich` in `backend` to enrich all incomplete database records.

### Task 4: Verification & Type Check
- **Action**:
  1. Run SQL verification queries to ensure 0 incomplete records.
  2. Run `tsc --noEmit` in `backend` and `frontend/apps/web` to confirm 0 errors.

---

## 4. Verification Checklist

- [ ] All scripts relocated to `backend/src/scripts/` and `.agents/skills/seed-vocabulary/scripts/`.
- [ ] No legacy root scripts in `backend/src/`.
- [ ] `package.json` scripts updated and functional.
- [ ] 0 words with null or missing `definition.vi`.
- [ ] 0 words with null `phoneticUs` or `phoneticUk`.
- [ ] 0 words with null `audioUsUrl` or `audioUkUrl`.
- [ ] 0 words with null `imageUrl`.
- [ ] 0 duplicate example sentences.
- [ ] `tsc --noEmit` passes with 0 errors in both `backend` and `apps/web`.
