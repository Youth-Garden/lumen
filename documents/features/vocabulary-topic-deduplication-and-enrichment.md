# Master Architectural Refactoring Plan: Relational Topic Entity (`vocab_topics`), Semantic Keyword Seeder & Complete Elimination of JSONB Workaround

> **Status**: In Review (Awaiting User Explicit Approval)
> **Author**: Antigravity Technical Architect / BA
> **Date**: 2026-09-28
> **Target Modules**:
> - `backend/src/contexts/vocabulary/`
> - `backend/src/scripts/`
> - `frontend/apps/web/src/features/vocabulary/`
> - `frontend/apps/web/src/services/vocabulary/`

---

## 1. Executive Summary & Root Cause Audit

### 1.1 The Core Anti-Pattern
In the current codebase, **Topic was never modeled as a relational entity**. Instead, an anti-pattern workaround was introduced:
- An entire JSONB object `{ en: "...", vi: "..." }` and `topicImageUrl` were repeatedly copied across tens of thousands of rows in `vocab_flashcards` and `vocab_words`.
- There is no `vocab_topics` table, no foreign key `topicId`, and no real primary key `id`.

### 1.2 Cascading Failures Produced by This Workaround
1. **PostgreSQL JSONB Binary Equality Mismatch**:
   - When executing `findFolderTopics`, PostgreSQL runs `GROUP BY flashcard.topic`.
   - Because rows in `vocab_flashcards` have varying JSONB structures (e.g., some have only `{"en": "..."}`, some have `{"en": "...", "vi": "..."}`, others have different whitespace or image URLs), PostgreSQL treats them as **distinct objects**.
   - Result: 28 duplicate rows for `Accounting, Tax & Fiscal Auditing`, 38 for `Contracts & Business Agreements`, etc.
2. **React Console Duplicate Key Warning**:
   - The frontend receives arrays with duplicate topic names and crashes the console with `Encountered two children with the same key`.
3. **Sequential Linear Index Slicing in Seeder**:
   - `assignSubTopic` slices CSV word rows by array index: `Math.floor(index / itemsPerTopic)`.
   - Words from index 312 to 389 in `TSL_12_stats.csv` (`garment`, `soup`, `plumber`, `oven`, `housekeeper`, `incur`, `minimize`) were all forcibly stuffed into Topic #4 (`Accounting, Tax & Fiscal Auditing`).
4. **Enrichment Script Skipping Terms**:
   - Seeder created placeholder definitions `{ en: term, vi: term }`.
   - The enrichment script skipped words where `enDef === term`, leaving terms without proper Vietnamese definitions.

---

## 2. Target Clean Relational Architecture

### 2.1 Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                vocab_folders                                │
│   - id: UUID (PK)                                                           │
│   - name: JSONB ({ en, vi })         <-- ONLY multilingual display is JSONB │
│   - description: JSONB ({ en, vi })                                         │
│   - category: JSONB ({ en, vi })                                            │
│   - isSystem: BOOLEAN                                                       │
│   - authorId: UUID                                                          │
│   - imageUrl: TEXT                                                          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ 1 : N
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 vocab_topics                                │
│   - id: UUID (PK, DEFAULT gen_random_uuid())                                │
│   - folderId: UUID (FK -> vocab_folders.id, ON DELETE CASCADE)              │
│   - name: JSONB ({ en, vi })         <-- ONLY multilingual display is JSONB │
│   - imageUrl: VARCHAR(1000)                                                 │
│   - orderIndex: INT (DEFAULT 0)                                             │
│   - created_at: TIMESTAMP WITH TIME ZONE                                    │
│   - updated_at: TIMESTAMP WITH TIME ZONE                                    │
│   - deleted_at: TIMESTAMP WITH TIME ZONE                                    │
│   UNIQUE ("folderId", (name->>'en'))                                        │
│   INDEX ("folderId")                                                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ 1 : N
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               vocab_flashcards                              │
│   - id: UUID (PK)                                                           │
│   - folderId: UUID (FK -> vocab_folders.id)                                 │
│   - wordId: UUID (FK -> vocab_words.id)                                     │
│   - topicId: UUID (FK -> vocab_topics.id, ON DELETE SET NULL)               │
│   UNIQUE ("folderId", "wordId")                                             │
│   INDEX ("topicId")                                                         │
│   [DROP COLUMN topic (JSONB)]                                               │
│   [DROP COLUMN topicImageUrl (VARCHAR)]                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Comprehensive File-by-File Refactoring Plan

### Phase 1: Database Migration & Entity Definition (Backend)

#### 1.1 Create `TopicEntity` (`backend/src/contexts/vocabulary/infrastructure/entities/topic.entity.ts`)
- Table: `vocab_topics`.
- Primary Key: `id: UUID`.
- Foreign Key: `folderId: UUID` linked to `FolderEntity` with `ON DELETE CASCADE`.
- Column: `name: I18nString` (`JSONB`, contains strictly `{ en: string, vi: string }`).
- Column: `imageUrl: string | null` (`VARCHAR(1000)`).
- Column: `orderIndex: number` (`INT`, default 0).
- Relation: `@ManyToOne(() => FolderEntity, folder => folder.topics)`
- Relation: `@OneToMany(() => FlashcardEntity, flashcard => flashcard.topic)`

#### 1.2 Update `FolderEntity` (`backend/src/contexts/vocabulary/infrastructure/entities/folder.entity.ts`)
- Add relation: `@OneToMany(() => TopicEntity, (topic) => topic.folder) topics: TopicEntity[];`

#### 1.3 Update `FlashcardEntity` (`backend/src/contexts/vocabulary/infrastructure/entities/flashcard.entity.ts`)
- Add column: `@Column({ name: 'topicId', type: 'uuid', nullable: true }) topicId: string | null;`
- Add relation: `@ManyToOne(() => TopicEntity, (topic) => topic.flashcards, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'topicId' }) topic: TopicEntity | null;`
- Mark legacy `topic` (JSONB) and `topicImageUrl` as deprecated / nullable during transition, then drop completely.

#### 1.4 Update `WordEntity` (`backend/src/contexts/vocabulary/infrastructure/entities/word.entity.ts`)
- Remove legacy `topic` (JSONB) and `topicImageUrl` columns completely. Words are master vocabulary terms shared across folders; topics belong strictly to folders.

#### 1.5 Update `VocabularyModule` (`backend/src/contexts/vocabulary/vocabulary.module.ts`)
- Register `TopicEntity` in `TypeOrmModule.forFeature([..., TopicEntity])`.

---

### Phase 2: DTOs & Query Repository Refactoring (Backend)

#### 2.1 Update `FolderTopicResponseDto` (`backend/src/contexts/vocabulary/application/responses/folder-topic.response.dto.ts`)
```ts
export class FolderTopicResponseDto {
  @ApiProperty({ description: 'Authentic UUID Primary Key of the Topic' })
  id: string;

  @ApiProperty({ description: 'Multilingual topic title map ({ en: "...", vi: "..." })' })
  name: I18nString;

  @ApiProperty({ nullable: true })
  imageUrl: string | null;

  @ApiProperty()
  orderIndex: number;

  @ApiProperty()
  count: number;

  @ApiProperty()
  learnedCount: number;

  @ApiProperty()
  dueCount: number;
}
```

#### 2.2 Rewrite `VocabularyQueryRepository.findFolderTopics` (`backend/src/contexts/vocabulary/infrastructure/repositories/vocabulary-query.repository.ts`)
Query directly from `vocab_topics` table:
```sql
SELECT 
  topic.id AS id,
  topic.name AS name,
  topic."imageUrl" AS "imageUrl",
  topic."orderIndex" AS "orderIndex",
  COUNT(DISTINCT flashcard.id)::int AS count,
  COUNT(DISTINCT CASE WHEN progress.id IS NOT NULL AND (progress.level >= 1 OR progress."learningStep" >= 5) THEN flashcard.id END)::int AS "learnedCount",
  COUNT(DISTINCT CASE WHEN progress.id IS NOT NULL AND progress."nextReviewAt" <= :now THEN flashcard.id END)::int AS "dueCount"
FROM vocab_topics topic
LEFT JOIN vocab_flashcards flashcard ON flashcard."topicId" = topic.id
LEFT JOIN vocab_user_progress progress ON progress."flashcardId" = flashcard.id AND progress."userId" = :userId
WHERE topic."folderId" = :folderId
GROUP BY topic.id, topic.name, topic."imageUrl", topic."orderIndex", topic.created_at
ORDER BY topic."orderIndex" ASC, topic.created_at ASC;
```
* **Zero Grouping on JSONB**: Groups strictly by `topic.id` (UUID).
* **Guaranteed Zero Duplicates**: PostgreSQL groups on the primary key.

#### 2.3 Update `findFlashcardsByFolderAndTopic`
- Accept `topicId?: string` (UUID).
- Filter cleanly: `flashcard."topicId" = :topicId`.
- Support backwards compatibility: If a string name is passed, match via `topic.name->>'en' = :topic`.

---

### Phase 3: Seeder & Data Migration (Backend)

#### 3.1 Topic Table Migration & Backfill Script
Create SQL migration to:
1. Create `vocab_topics` table if not exists with all constraints and indices.
2. Backfill `vocab_topics` from distinct `(folderId, topic)` in `vocab_flashcards`.
3. Update `vocab_flashcards."topicId"` with the generated `vocab_topics.id`.

#### 3.2 Implement Domain Keyword Classifier (`backend/src/contexts/vocabulary/infrastructure/seed/ngsl-datasets.config.ts`)
- Define semantic domain keywords for all 16 topics in `tsl-toeic`:
  - `Hotels, Hospitality & Event Catering`: `soup`, `luncheon`, `oven`, `chef`, `dish`, `cook`, `housekeeper`, `beverage`, `meal`, `dining`, `restaurant`...
  - `Office Tech, Software & IT Support`: `plumber`, `repair`, `hardware`, `software`, `server`, `network`, `technician`, `directory`, `device`...
  - `Compensation, Benefits & Training`: `paycheck`, `wage`, `salary`, `pension`, `bonus`, `train`, `workshop`, `enroll`...
  - `Supply Chain & Warehousing`: `garment`, `inventory`, `warehouse`, `freight`, `cargo`, `packet`, `pallet`...
  - `Accounting, Tax & Fiscal Auditing`: `tax`, `audit`, `invoice`, `ledger`, `fiscal`, `accounting`, `budget`, `balance`...
  - (Complete keyword dictionary for all domains).
- For unclassified general words: Use deterministic hash `hashString(term) % subTopics.length` to guarantee uniform, balanced spread without alphabetical clustering.

#### 3.3 Update `ngsl-seeder.service.ts`
1. Seed `vocab_topics` rows first for each folder, storing a map `(enName -> topicId)`.
2. When linking flashcards, assign `flashcard.topicId = topicMap.get(subTopic.en)`.
3. Bulk insert/update with raw SQL targeting `topicId: UUID`.

#### 3.4 Fix `enrich-vocabulary-data.ts`
- Remove `if (!enDef || enDef.toLowerCase() === term) return false;`.
- Add direct term translation fallback via `translateText(term, 'vi')` when dictionary API does not return a definition text.
- Ensure 100% of vocabulary words have genuine, high-quality Vietnamese translations.

---

### Phase 4: Frontend Synchronization

#### 4.1 Update Vocabulary Service Types (`frontend/apps/web/src/services/vocabulary/vocabulary.types.ts`)
- Update `FolderTopic`:
  ```ts
  export interface FolderTopic {
    id: string; // The real UUID
    name: I18nString;
    imageUrl?: string | null;
    count: number;
    learnedCount: number;
    dueCount: number;
  }
  ```

#### 4.2 Update `FolderTopicGrid` (`frontend/apps/web/src/features/vocabulary/components/folder-detail/folder-topic-grid.tsx`)
- Render topic card with `key={topic.id}` (the authentic UUID from the database).
- Display title via `i18nText(topic.name, locale)`.
- Click handler triggers `onSelectTopic(topic.id, topicTitle)`.

#### 4.3 Update `folder-detail-page.tsx` & `topic-detail-page.tsx`
- Remove any ad-hoc deduplication workarounds.
- Use `topic.id` cleanly in state and routes.

---

## 4. Verification & Testing Matrix

| Test Step | Verification Command / Query | Success Criteria |
| :--- | :--- | :--- |
| **Backend TypeScript** | `npx tsc --noEmit` in `backend/` | 0 errors |
| **Frontend TypeScript** | `pnpm run check-types` in `frontend/` | 0 errors |
| **Database Topics Table** | `SELECT COUNT(*), COUNT(DISTINCT id) FROM vocab_topics` | Count matches distinct ID count |
| **Zero Duplicates Query** | `GET /api/v1/vocabulary/folders/:id/topics` | Returns exactly 16 unique topic objects for TOEIC Advanced |
| **Semantic Placement** | Query `soup`, `plumber`, `paycheck`, `garment` | Verified inside Hospitality, IT Support, Compensation, Supply Chain |
| **React Console** | Open browser console on folder detail page | 0 React duplicate key errors |
| **Bilingual Quality** | Query `vocab_definitions WHERE definition->>'vi' = word.term` | Exactly 0 rows (100% translated) |

---

## 5. Explicit Approval Prompt

Please review this exhaustive master plan. If you approve, I will begin implementing Phase 1 immediately without any shortcuts or workarounds.
