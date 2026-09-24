---
name: seed-vocabulary
description: Core workflow, data deduplication architecture, bulk SQL pipeline, sub-topic isolation on FlashcardEntity, image uniqueness rules, folder naming conventions, PostgreSQL gotchas, and execution steps for seeding vocabulary datasets in Lumen.
---

# Vocabulary Data Seeding & Data Pipeline Skill — Lumen

This skill defines the mandatory architecture, data modeling contracts, bulk SQL pipeline, edge-case handling, and execution guidelines for seeding large-scale vocabulary datasets (NGSL, TSL, NAWL, BSL, NGSL-S, NDL, TOEIC 600) into the Lumen platform.

---

## 1. Core Architectural Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MASTER VOCABULARY DATA                           │
│                                                                             │
│   vocab_words (Master Terms)             vocab_definitions                  │
│   - id (UUID)                            - id (UUID)                        │
│   - term (UNIQUE, normalized lower)      - wordId (FK -> vocab_words.id)     │
│   - cefrLevel (A1-C2)                    - partOfSpeech                     │
│                                          - definition (VI/EN)               │
└───────────────────────┬─────────────────────────────────────────────────────┘
                        │ 1 : N
                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FOLDER / FLASHCARD ISOLATION LAYER                    │
│                                                                             │
│   vocab_folders (Decks / Categories)     vocab_flashcards (Junction + Topic)│
│   - id (UUID)                            - id (UUID)                        │
│   - name (JSONB: { en, vi })             - folderId (FK)                    │
│   - isSystem: true                       - wordId (FK)                      │
│   - category (JSONB: { en, vi })         - topic (EN thematic cluster)      │
│   - authorId (System Admin)              - topicVi (VI thematic cluster)    │
│                                          - topicImageUrl (Unsplash URL)     │
│                                          UNIQUE ("folderId", "wordId")      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Master Word Deduplication (`vocab_words`)
- **Single Source of Truth**: All vocabulary terms are stored in `WordEntity` (`vocab_words`). A term **MUST exist once and only once** in the database (`@Column({ unique: true }) term`).
- **Normalization**: Every incoming term must be strictly sanitized: `term.trim().toLowerCase()`.
- **Cross-Folder Sharing**: Multiple folders referencing the same English word (e.g. `"contract"` in *General English*, *TOEIC Advanced*, and *Business English*) share the **same `wordId`** via `vocab_flashcards`. Master word records are never duplicated.

### 1.2 Sub-Topic Isolation on `FlashcardEntity` (MANDATORY)
- **Folder-Specific Categorization**: `topic`, `topicVi`, and `topicImageUrl` columns live directly on `vocab_flashcards`, **NOT on `vocab_words`**.
- **Contextual Thematic Clustering**: The same master word can belong to different thematic topics depending on the folder context (e.g. `"market"` can be in *Daily Life* in General English, but in *Financial Markets* in Business English).
- **Legacy Backfill**: `vocab_words` retains `topic`/`topicVi`/`topicImageUrl` solely for legacy compatibility with the original TOEIC 600 dataset. Step 2 of the seeder backfills these into flashcard topics if missing.

### 1.3 User Progress Continuity (`vocab_user_progress`)
- **Composite Key**: `UserProgressEntity` is keyed on `(userId, flashcardId)`.
- **Independent Tracking**: User review intervals (SM-2 / FSRS algorithm) are tracked per flashcard in a specific deck.
- **Master Term Knowledge**: The application layer can query a user's global mastery of a master `wordId` across all folders without conflating study states.

---

## 2. Bulk SQL Pipeline & Database Gotchas

> [!CAUTION]
> **NEVER USE TypeORM `repo.save()` LOOPS FOR SEEDING**
> 1. Individual ORM `save()` calls create N+1 transaction overhead and exhaust the database connection pool.
> 2. ORM hooks trigger Redis cache invalidations per entity, causing Redis `ERR max requests limit exceeded`.
> 3. **All seed writes MUST use raw `dataSource.query()` with bulk `INSERT ... VALUES` or `UPDATE FROM (VALUES ...)` batches.**

### 2.1 Chunk Sizing & Parameter Limits

PostgreSQL enforces a hard limit of 65,535 parameters per query. Batch sizes must stay strictly within bounds:

| Operation | Chunk Size | Params / Row | Total Params / Query | Safety Margin |
| :--- | :--- | :--- | :--- | :--- |
| **Word INSERT** | 200 | 2 (`term`, `cefrLevel`) | 400 | > 99% safe |
| **Flashcard INSERT** | 200 | 5 (`folderId`, `wordId`, `topic`, `topicVi`, `topicImageUrl`) | 1,000 | > 98% safe |
| **Flashcard UPDATE** | 200 | 4 (`id`, `topic`, `topicVi`, `topicImageUrl`) | 800 | > 98% safe |
| **Definition INSERT** | 200 | 3 (`wordId`, `partOfSpeech`, `definition`) | 600 | > 99% safe |

### 2.2 Column Name Formatting Rules (CRITICAL)

TypeORM column mapping rules determine how column names must be written in raw SQL:

1. **Columns inheriting from `BaseEntity`** have explicit snake_case overrides:
   - `created_at`, `updated_at`, `deleted_at` (MUST be unquoted snake_case).
   - **WRONG**: `"createdAt"`, `"updatedAt"` $\rightarrow$ throws Postgres error `42703 column does not exist`.

2. **CamelCase entity properties without explicit name overrides** become quoted camelCase in Postgres:
   - `"cefrLevel"`, `"wordId"`, `"folderId"`, `"topicVi"`, `"topicImageUrl"`, `"partOfSpeech"`, `"authorId"`, `"isSystem"`.
   - **WRONG**: `wordid`, `folderid`, `topicimageurl` $\rightarrow$ Postgres lowercases unquoted identifiers, causing `42703 column does not exist`.

### 2.3 Idempotent `ON CONFLICT` Strategies

All bulk queries must be strictly idempotent to allow safe re-runs:

```sql
-- 1. Master Words: ON CONFLICT on unique term
INSERT INTO vocab_words (id, term, "cefrLevel", created_at, updated_at)
VALUES ($1, $2, $3, NOW(), NOW()), ...
ON CONFLICT (term) DO UPDATE SET updated_at = NOW()
RETURNING id, term, "cefrLevel";

-- 2. Flashcards: ON CONFLICT on composite index ("folderId", "wordId")
INSERT INTO vocab_flashcards (id, "folderId", "wordId", topic, "topicVi", "topicImageUrl", created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()), ...
ON CONFLICT ("folderId", "wordId") DO UPDATE
SET topic = EXCLUDED.topic,
    "topicVi" = EXCLUDED."topicVi",
    "topicImageUrl" = EXCLUDED."topicImageUrl",
    updated_at = NOW();

-- 3. Flashcards Batch Topic Update (Existing records)
UPDATE vocab_flashcards AS f
SET topic = v.topic,
    "topicVi" = v.topic_vi,
    "topicImageUrl" = v.topic_image_url,
    updated_at = NOW()
FROM (VALUES ($1::uuid, $2::text, $3::text, $4::text), ...) AS v(id, topic, topic_vi, topic_image_url)
WHERE f.id = v.id;

-- 4. Definitions: Check against preloaded Set<string> of wordIds before queuing
INSERT INTO vocab_definitions (id, "wordId", "partOfSpeech", definition, created_at, updated_at)
VALUES ($1, $2, $3, $4, NOW(), NOW()), ...;
```

---

## 3. Dataset Configuration & Topic Design Rules

File: `backend/src/contexts/vocabulary/infrastructure/seed/ngsl-datasets.config.ts`

### 3.1 Folder Naming Standard
- **Concise & Punchy**: Folder names must be natural, descriptive, and clean.
- **No Acronyms in Parentheses**: Never use `Essential General English (NGSL)` or `TOEIC Service List (TSL)`.
- **Standard Names**:

| Dataset ID | `name.en` | `name.vi` |
| :--- | :--- | :--- |
| `ngsl-core` | `General English` | `Tiếng Anh giao tiếp` |
| `tsl-toeic` | `TOEIC Advanced` | `Từ vựng TOEIC nâng cao` |
| `nawl-academic` | `Academic English` | `Tiếng Anh học thuật` |
| `bsl-business` | `Business English` | `Tiếng Anh thương mại` |
| `ngsl-spoken` | `Spoken English` | `Tiếng Anh đàm thoại` |
| `ndl-foundation` | `Foundation English` | `Tiếng Anh nền tảng` |

### 3.2 Sub-Topic Sizing & Distribution Standard
- **Granularity Target**: **60 – 120 words per sub-topic**.
- **Hard Minimum**: Sub-topics must contain **at least ~50 words**. Never create micro-topics with only 1–15 words.
- **Balanced Distribution**: `assignSubTopic(config, index, totalRows)` calculates `itemsPerTopic = Math.ceil(totalRows / subTopics.length)` to guarantee even spread.

| Dataset | Total Words | Sub-Topics | Words / Topic | Status |
| :--- | :--- | :--- | :--- | :--- |
| `ngsl-core` | ~2,807 | 24 | ~117 | Active |
| `tsl-toeic` | ~1,250 | 16 | ~78 | Active |
| `nawl-academic` | ~957 | 12 | ~80 | Active |
| `bsl-business` | ~1,744 | 16 | ~109 | Active |
| `ngsl-spoken` | ~719 | 12 | ~60 | Active |
| `ndl-foundation` | ~875 | 12 | ~73 | CSV Fallback |

### 3.3 Image Uniqueness & Curation Rules (MANDATORY)

- **100% Globally Unique Images**: Every `imageUrl` across **ALL** dataset configs (including the fallback image in `assignSubTopic`) must use a unique Unsplash photo ID (`photo-XXXXXXXXXXXXX`).
- **Audit Requirement**: Before committing any config change or adding datasets, run the PowerShell uniqueness audit:
  ```powershell
  Select-String -Pattern "photo-\d+" src/contexts/vocabulary/infrastructure/seed/ngsl-datasets.config.ts |
    ForEach-Object { $_.Matches[0].Value } |
    Sort-Object | Group-Object | Where-Object { $_.Count -gt 1 }
  ```
  **Rule**: Output must be completely empty.
- **Image Reuse Policy**:
  - If a topic name and domain context match an existing topic *identically*, preserve the existing image URL on its first occurrence.
  - Any subsequent or duplicate occurrence must receive a fresh, high-quality Unsplash image relevant to that sub-topic.

---

## 4. Seeder Execution Flow & Architecture

```
[Start]
  │
  ├─► 1. Ensure System Admin User (system@lumen.com) -> Get adminId
  │
  ├─► 2. Backfill TOEIC 600 legacy topics from vocab_words to vocab_flashcards
  │
  ├─► 3. Pre-load master cache:
  │      ├── Map<string, WordEntity>: all existing terms (normalized lower)
  │      └── Set<string>: all wordIds that already have definitions
  │
  ├─► 4. Iterate over NGSL_DATASETS:
  │      │
  │      ├─► Find or Create FolderEntity (isSystem = true, match by name.en)
  │      │   Update folder name, description, category if modified
  │      │
  │      ├─► Fetch & parse CSV (Handle 404/empty gracefully without crash)
  │      │
  │      ├─► Deduplicate words: filter out terms already in Map
  │      │   Bulk INSERT new words (chunk 200) RETURNING id -> update Map
  │      │
  │      ├─► Query existing flashcards for current folderId -> Map<wordId, Flashcard>
  │      │
  │      ├─► For each CSV word index:
  │      │   ├── Compute sub-topic via assignSubTopic(config, index, total)
  │      │   ├── If flashcard missing -> queue Flashcard INSERT
  │      │   ├── If flashcard exists but topic/image changed -> queue Flashcard UPDATE
  │      │   └── If wordId not in definitionSet -> queue Definition INSERT
  │      │
  │      ├─► Bulk INSERT new flashcards (chunk 200, ON CONFLICT DO UPDATE)
  │      ├─► Bulk UPDATE modified flashcards (chunk 200, VALUES list join)
  │      └─► Bulk INSERT new definitions (chunk 200)
  │
  └─► [Finish] Output summary table of processed folders, words, and flashcards
```

---

## 5. Execution Commands & Verification Runbook

### 5.1 Run Seeder
From the `backend` workspace root:

```bash
cd backend
npx ts-node -r tsconfig-paths/register src/seed-ngsl-vocabulary.ts
```

### 5.2 Verification Checklist Before Claiming Done
- [ ] **Type Check**: Run `npx tsc --noEmit` in `backend` $\rightarrow$ must pass with 0 errors.
- [ ] **Image Audit**: Run PowerShell photo ID uniqueness check $\rightarrow$ must return 0 duplicates.
- [ ] **DB Integrity Verification**:
  ```sql
  -- 1. Check folder counts & flashcard distribution
  SELECT f.name->>'en' AS folder_name, COUNT(fc.id) AS flashcard_count, COUNT(DISTINCT fc.topic) AS topic_count
  FROM vocab_folders f
  JOIN vocab_flashcards fc ON fc."folderId" = f.id
  WHERE f."isSystem" = true
  GROUP BY f.id, f.name;

  -- 2. Verify zero orphan flashcards
  SELECT COUNT(*) FROM vocab_flashcards fc
  LEFT JOIN vocab_words w ON fc."wordId" = w.id
  WHERE w.id IS NULL; -- Must be 0

  -- 3. Verify master word uniqueness
  SELECT term, COUNT(*) FROM vocab_words
  GROUP BY term HAVING COUNT(*) > 1; -- Must be 0
  ```
- [ ] **Idempotency Verification**: Running the seed script twice in a row outputs `0 new words inserted`, and finishes cleanly in seconds.
