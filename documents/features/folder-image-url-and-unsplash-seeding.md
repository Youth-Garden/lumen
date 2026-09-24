# Feature Plan: Database-Driven Folder Images & Unsplash Seeding Architecture

> **Status**: In Review
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-24
> **Target Module**: `backend/src/contexts/vocabulary/...`, `frontend/apps/web/src/features/vocabulary/...`, and `frontend/apps/web/src/services/vocabulary/...`

---

## 1. Overview & Objectives

Currently, folder covers in `folder-card.tsx` are hardcoded in a frontend dictionary (`FOLDER_COVERS`) matching static string titles. This creates hard maintenance coupling and prevents dynamic folder cover customizations.
This feature elevates folder images into a first-class database entity attribute across Backend, DB, API DTOs, Seeder Pipeline, and Frontend UI:
1. **Database Schema Enhancement (`vocab_folders`)**:
   - Add `imageUrl` column (`text`, nullable) to `FolderEntity` in TypeORM.
2. **DTO & Contract Normalization**:
   - Expose `imageUrl?: string | null` in `FolderResponseDto`, `FolderDetailResponseDto`, and frontend `Folder` model.
3. **English Keyword Unsplash Image Dataset Seeding**:
   - Add dedicated English-searched Unsplash image URLs to `NgslDatasetConfig` in `ngsl-datasets.config.ts`.
   - Update `ngsl-seeder.service.ts` and `seed.ts` to populate/backfill `imageUrl` on all system vocabulary folders.
4. **Purge Frontend Hardcoded Dictionary**:
   - Completely remove the `FOLDER_COVERS` static dictionary from `folder-card.tsx`.
   - Resolve folder covers dynamically: `folder.imageUrl || getFolderCoverUrl(folder.id)`.

---

## 2. Requirements & Scope

### Functional Requirements
- [ ] **Backend Database Migration & Entity**:
  - Add `@Column({ type: 'text', nullable: true }) imageUrl: string | null;` to `FolderEntity`.
- [ ] **Backend API Response DTO**:
  - Add `@ApiProperty({ nullable: true, required: false }) imageUrl?: string | null;` to `FolderResponseDto`.
- [ ] **Vocabulary Query Repository & Handlers**:
  - Update `listFolders`, `getFolderById`, and raw query builders to select and map `imageUrl`.
- [ ] **Seeding Pipeline (`ngsl-datasets.config.ts` & `ngsl-seeder.service.ts`)**:
  - Add high-quality, English-searched Unsplash image URLs for each folder:
    - *General English (NGSL)*: `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80` (English keywords: *english communication learners group*)
    - *TOEIC Advanced (TSL)*: `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80` (English keywords: *corporate skyscraper business strategy*)
    - *Academic English (NAWL)*: `https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80` (English keywords: *university academic library study*)
    - *Business English (BSL)*: `https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&auto=format&fit=crop&q=80` (English keywords: *modern business office meeting*)
    - *Spoken English (NGSL-S)*: `https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80` (English keywords: *coffee chat conversational friends*)
    - *Foundation English (NDL)*: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80` (English keywords: *early childhood learning ABC foundation*)
    - *600 Essential Words for TOEIC*: `https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80` (English keywords: *exam test preparation notebook*)
  - Backfill `imageUrl` on existing folders in database via seeder script.
- [ ] **Frontend Model & Mapper**:
  - Update `Folder` interface in `services/vocabulary/vocabulary.types.ts` with `imageUrl?: string | null`.
  - Update `folderMapper` in `services/vocabulary/vocabulary.mappers.ts` to map `imageUrl`.
- [ ] **Frontend FolderCard Component**:
  - Delete static `FOLDER_COVERS` mapping object in `folder-card.tsx`.
  - Render `folder.imageUrl || getFolderCoverUrl(folder.id)`.

### Non-Functional Requirements
- **Clean Architecture**: Single Source of Truth in DB, eliminating frontend hardcoded mock tables.
- **Type Safety**: 0 `any` bypasses across Backend and Frontend.
- **English-Only Unsplash Searches**: All image search keywords and asset selection must be in English.

---

## 3. UI/UX Specifications (Frontend)

- **Responsive Visual Cover**: Folder card renders `folder.imageUrl` with responsive sizing and standard gradient overlay.
- **Fallback**: Gracefully falls back to deterministic procedural color cover (`getFolderCoverUrl(folder.id)`) if `imageUrl` is empty or null.

---

## 4. Architecture & Technical Contracts

### 4.1 Database & Entity Contract (`FolderEntity`)

```typescript
@Entity('vocab_folders')
@Index('idx_folders_author_id', ['authorId'])
export class FolderEntity extends BaseEntity {
  @Column({ type: 'jsonb', default: {} })
  name: Record<string, string> | string;

  @Column({ type: 'jsonb', nullable: true })
  description: Record<string, string> | string | null;

  @Column({ type: 'uuid', nullable: false })
  authorId: string;

  @Column({ type: 'jsonb', nullable: true })
  category: Record<string, string> | string | null;

  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @OneToMany(() => FlashcardEntity, (flashcard) => flashcard.folder)
  flashcards: FlashcardEntity[];
}
```

### 4.2 API Response DTO (`FolderResponseDto`)

```typescript
export class FolderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ oneOf: [{ type: 'string' }, { type: 'object' }] })
  name: Record<string, string> | string;

  @ApiProperty({ nullable: true })
  description: Record<string, string> | string | null;

  @ApiProperty({ nullable: true })
  category: Record<string, string> | string | null;

  @ApiProperty()
  isSystem: boolean;

  @ApiProperty({ nullable: true, required: false })
  imageUrl?: string | null;

  @ApiProperty()
  flashcardCount: number;

  @ApiProperty({ required: false })
  learnedCount?: number;

  @ApiProperty({ required: false })
  dueCount?: number;
}
```

### 4.3 Frontend Type Model (`Folder`)

```typescript
export interface Folder {
  id: string;
  name: I18nString;
  description: I18nString | null;
  category: I18nString | null;
  imageUrl?: string | null;
  isSystem: boolean;
  flashcardCount: number;
  learnedCount: number;
  dueCount: number;
}
```

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `backend/src/contexts/vocabulary/infrastructure/entities/folder.entity.ts` | Add `imageUrl` column to TypeORM entity |
| `[MODIFY]` | `backend/src/contexts/vocabulary/application/responses/folder.response.dto.ts` | Add `imageUrl` property to `FolderResponseDto` |
| `[MODIFY]` | `backend/src/contexts/vocabulary/infrastructure/repositories/vocabulary-query.repository.ts` | Select and map `imageUrl` in repository queries |
| `[MODIFY]` | `backend/src/contexts/vocabulary/infrastructure/seed/ngsl-datasets.config.ts` | Add English Unsplash `imageUrl` to dataset configurations |
| `[MODIFY]` | `backend/src/contexts/vocabulary/infrastructure/seed/ngsl-seeder.service.ts` | Populate `folder.imageUrl` and backfill database |
| `[MODIFY]` | `frontend/apps/web/src/services/vocabulary/vocabulary.types.ts` | Add `imageUrl?: string | null` to `Folder` interface |
| `[MODIFY]` | `frontend/apps/web/src/services/vocabulary/vocabulary.mappers.ts` | Map `imageUrl` in `folderMapper` |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/components/cards/folder-card.tsx` | Purge static `FOLDER_COVERS` and use `folder.imageUrl` |

---

## 6. Implementation & Quality Verification Checklist

- [ ] Backend build check: `tsc --noEmit` in `backend/` passes with 0 errors.
- [ ] Frontend build check: `tsc --noEmit` in `frontend/apps/web` passes with 0 errors.
- [ ] Database seeder runs and updates `imageUrl` on all system folders.
- [ ] Frontend `FolderCard` renders database `folder.imageUrl` cleanly without hardcoded dictionaries.
- [ ] All tests pass (`vitest run` in frontend and backend).
- [ ] ESLint and Prettier pass with 0 errors.

---

## 7. Risks & Technical Considerations

- **Backfill existing database rows**: Seeder will execute an `UPDATE vocab_folders SET "imageUrl" = ...` script to ensure previously seeded database folders immediately receive their Unsplash images without requiring database drop/re-creation.
