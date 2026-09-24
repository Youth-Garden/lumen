# Feature Plan: NGSL Open-Source Vocabulary Data Seeding Pipeline

> **Status**: In Review
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-24
> **Target Module**: `backend/src/seed-ngsl-vocabulary.ts`, `backend/package.json`

---

## 1. Overview & Objectives

This feature establishes an automated Data Ingestion & Seeding Pipeline to import official, open-source English vocabulary datasets from the **NGSL Project** (New General Service List by Browne, Culligan & Phillips, licensed under Creative Commons Attribution-ShareAlike 4.0 - 100% free for commercial use).

### Key Business & Educational Objectives:
1. **Legally Compliant Core Content**: Replace copyrighted vocabulary books with official, open-access, research-backed word lists covering General, Business, Academic, and Spoken English.
2. **Structured Category & Folder Hierarchy**: Automatically seed 5 structured Folders containing 7,000+ curated vocabulary words categorized by domain and topic:
   - **NGSL Core** (2,809 words): Covers ~92% of standard English texts (General English).
   - **TSL (TOEIC Service List)** (1,200 words): Covers ~99% of TOEIC test vocabulary across business topics.
   - **NAWL (New Academic Word List)** (960 words): Academic English for IELTS & TOEFL reading/writing.
   - **BSL (Business Service List)** (1,700 words): Corporate, financial, and office communication.
   - **NGSL-S (Spoken)** (721 words): Conversational English for listening and speaking.
   - **NDL (New Dolch List)** (874 words): Foundational vocabulary for beginners and young learners.
   - **NGSL-GR (Graded Reader)** (up to 5,000 words): Mid-frequency expansion for intermediate to advanced learners.
3. **Automated Enrichment & Image Strategy**:
   - Assigns CEFR levels (`A1`, `A2`, `B1`, `B2`, `C1`) based on NGSL frequency rank thresholds and CEFR-J mappings.
   - Generates bilingual definitions (`definitionEn`, `definitionVi`), example sentences (`exampleEn`, `exampleVi`), parts of speech, and phonetic IPA.
   - **Image Handling Strategy**: Unsplash / Pexels API + AI Illustration fallback for concrete terms (nouns/objects), leaving abstract words clean without inaccurate image clutter.

---

## 2. Requirements & Scope

### Functional Requirements
- [ ] **Data Fetching & Extraction**:
  - Script fetches raw CSV/XLSX datasets from official NGSL Project endpoints (`https://www.newgeneralservicelist.com/s/...`).
  - Implements CSV parsing and data normalization.
- [ ] **Database Schema Ingestion**:
  - Upserts `FolderEntity`, `TopicEntity`, and `VocabularyWordEntity` in PostgreSQL.
  - Prevents duplicate word insertions using unique index constraints (`(topicId, word)`).
- [ ] **CEFR Level Inference & CEFR-J Mapping**:
  - Maps frequency ranks to CEFR tiers:
    - Rank 1 – 1,000: `A1` – `A2` (Elementary / Pre-Intermediate)
    - Rank 1,001 – 2,000: `B1` (Intermediate)
    - Rank 2,001 – 2,809+: `B2` – `C1` (Upper-Intermediate / Advanced)
- [ ] **Cloudinary CDN Image Pipeline Integration**:
  - Automatically executes image search via Unsplash API, uploads to Cloudinary CDN, and updates `imageUrl` fields for all seeded topics and words.
- [ ] **NPM Runnable Command**:
  - Register `"seed:ngsl"` in `backend/package.json` for easy CLI execution (`pnpm --filter backend seed:ngsl`).

### Non-Functional Requirements
- **Performance**: Batch database upserts (`chunks` of 100 words per transaction) to prevent connection timeouts and memory overflow.
- **Idempotency**: Running `seed:ngsl` multiple times MUST NOT corrupt data or create duplicate records.
- **Strict Data Validation**: Reject malformed rows; enforce non-null constraints on mandatory fields (`word`, `meaning`, `cefrLevel`).

### Out of Scope
- Interactive manual editing UI for seeded NGSL words (uses existing Admin / Vocabulary API endpoints).
- Audio TTS generation (handled dynamically by existing TTS service).

---

## 3. UI/UX Specifications (Frontend Integration)

- **Folder & Topic Display**:
  - Seeded folders ("Essential English - NGSL", "TOEIC Master - TSL", "Academic - NAWL", "Business - BSL", "Spoken - NGSL-S") render seamlessly on `VocabularyListPage` and `FolderDetailPage`.
  - Single-locale display rule enforced: Topic titles display strictly in active `locale` without secondary language subtitle clutter.
- **Word Detail Sheet**:
  - Displays word title, phonetic IPA, CEFR badge (`A1`-`C1`), part of speech, Cloudinary image, localized definitions, and example sentences.

---

## 4. Architecture & Technical Contracts

### Backend ETL Pipeline Architecture (`backend/src/seed-ngsl-vocabulary.ts`)

```
+------------------------------------+
|  NGSL Project Official Datasets    |
| (NGSL, TSL, NAWL, BSL, NGSL-S CSV) |
+------------------------------------+
                  |
                  v
+------------------------------------+
|   CSV Parser & ETL Processor       |
|  - Deduplicate & Normalize         |
|  - Assign CEFR via Frequency Rank  |
|  - Map Part-of-Speech & Phonetic   |
+------------------------------------+
                  |
                  v
+------------------------------------+
|    TypeORM Batch Upsert Handler    |
|  - Folders -> Topics -> Words      |
+------------------------------------+
                  |
                  v
+------------------------------------+
| Cloudinary CDN Image Pipeline      |
| (Unsplash API -> CDN Upload)       |
+------------------------------------+
```

### Dataset Structure & Folder Mapping

| Dataset | Word Count | Target Folder Name | Category | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **NGSL** | 2,809 | Essential English Vocabulary (NGSL) | General | Foundational core vocabulary (92% text coverage) |
| **TSL** | 1,200 | TOEIC Master Vocabulary (TSL) | TOEIC | Replaces Barron's 600 TOEIC; 99% TOEIC test coverage |
| **NAWL** | 960 | Academic Vocabulary (NAWL) | Academic | IELTS / TOEFL reading & writing preparation |
| **BSL** | 1,700 | Business & Corporate English (BSL) | Business | Office, finance, management & corporate communication |
| **NGSL-S** | 721 | Spoken & Conversational English | Spoken | Everyday conversation, listening & speaking fluency |
| **NDL** | 874 | Foundation & Beginner English (NDL) | Foundation | Kids & absolute beginners core words |
| **NGSL-GR** | ~5,000 | Graded Reading & Expansion (NGSL-GR) | Advanced | Mid-frequency vocabulary expansion |

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[NEW]` | `backend/src/seed-ngsl-vocabulary.ts` | Main ETL seeding script for downloading, parsing, and upserting NGSL datasets |
| `[MODIFY]` | `backend/package.json` | Add `"seed:ngsl"` script target |

---

## 6. Implementation & Quality Verification Checklist

- [ ] Backend script executes idempotently via `pnpm --filter backend seed:ngsl`.
- [ ] All 5 folders, associated topics, and words correctly seeded in PostgreSQL.
- [ ] No duplicate database records created on repeated execution.
- [ ] Backend build check: `tsc --noEmit` in `backend/` passes with 0 errors.
- [ ] Frontend build check: `tsc --noEmit` in `frontend/` passes with 0 errors.
- [ ] No `any` type bypasses in script implementation.
- [ ] All seeded word definitions properly localized for `en` and `vi`.

---

## 7. Risks & Technical Considerations

1. **Remote CSV Availability & Timeout**:
   - *Risk*: Remote URL down or slow network connection during seeding.
   - *Mitigation*: Cache downloaded CSV files in `backend/data/ngsl/` locally fallback if remote request fails.
2. **Database Transaction Size**:
   - *Risk*: Attempting to insert 7,000+ words in a single query may exceed Postgres parameter limits.
   - *Mitigation*: Batch insert operations in chunks of 100 items per database transaction.
