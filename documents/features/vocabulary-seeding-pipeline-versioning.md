# Feature Plan: Vocabulary Seeding Pipeline, Seed Versioning & Asset Migration

> **Status**: Approved
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-25
> **Target Module**: `backend/src/contexts/vocabulary`, `frontend/apps/web/src/features/vocabulary`

---

## 1. Overview & Objectives

This document outlines the architectural enhancements to the Lumen Vocabulary Seeding Pipeline and dataset integrity. The objective is to fix dataset seeding gaps, eliminate broken folder routes, enforce 100% Cloudinary CDN image delivery (removing all raw Unsplash URLs), and introduce **Seed Version Tracking (`vocab_seed_versions`)** for complete auditability.

---

## 2. Requirements & Scope

### Functional Requirements
- [x] **Seed Versioning System (`vocab_seed_versions`)**: Create a migration version table to track every seed execution with version tag, timestamp, entity counts, and status (`COMPLETED`).
- [x] **Foundation English Dataset Fallback**: Provide embedded CSV fallback data for `ndl-foundation` dataset to guarantee 875+ A1 terms seed even if external CSV downloads fail.
- [x] **100% Cloudinary Image Migration**: Automatically convert and upload all folder cover images, sub-topic images, and word images to Cloudinary CDN (`res.cloudinary.com`). Update `vocab_folders`, `vocab_flashcards`, and `vocab_words` tables to ensure 0 raw Unsplash URLs exist in production DB.
- [x] **Folder Topics 404 Route Fix**: Create fallback redirect page at `/vocabulary/folders/[id]/topics/page.tsx` and sanitize `topicName` parameter encoding in `FolderDetailPage`.

### Non-Functional Requirements
- Type safety: Zero `any` bypasses, strict type checking with `tsc --noEmit`.
- Idempotency: Running seeder multiple times produces identical clean state with 0 duplicate folders.

---

## 3. UI/UX Specifications (Frontend)

- **Route Handling**: Clicking a topic safely navigates to `/vocabulary/folders/[id]/topics/[topic]`. If `/vocabulary/folders/[id]/topics` is accessed directly, it redirects smoothly to `/vocabulary/folders/[id]`.
- **Image Performance**: All topic icons and folder cover cards load instantly via Cloudinary WebP/Auto CDN.

---

## 4. Architecture & Technical Contracts

### Backend (NestJS DDD Monolith)
- **Table `vocab_seed_versions`**:
  - `id`: UUID (Primary Key)
  - `version`: string (e.g. `'v1.0.0-master-seed'`)
  - `appliedAt`: timestamp
  - `folderCount`: number
  - `wordCount`: number
  - `flashcardCount`: number
  - `status`: string (`'COMPLETED'`)
- **Seeder Pipeline Execution (`ngsl-seeder.service.ts`)**:
  - Step 1: Ensure Admin User
  - Step 2: Clean legacy duplicate folders
  - Step 3: Seed Words & Flashcards with fallback NDL dataset
  - Step 4: Sync all images to Cloudinary
  - Step 5: Log seed version in `vocab_seed_versions`

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[NEW]` | `documents/features/vocabulary-seeding-pipeline-versioning.md` | BA Feature Specification |
| `[NEW]` | `backend/src/contexts/vocabulary/infrastructure/entities/seed-version.entity.ts` | Seed Version Tracking Entity |
| `[MODIFY]` | `backend/src/contexts/vocabulary/infrastructure/seed/ngsl-csv-parser.ts` | Embedded fallback CSV for NDL dataset |
| `[MODIFY]` | `backend/src/contexts/vocabulary/infrastructure/seed/ngsl-seeder.service.ts` | Seeder pipeline, Cloudinary image sync, version recording |
| `[NEW]` | `frontend/apps/web/src/app/[locale]/(dashboard)/vocabulary/folders/[id]/topics/page.tsx` | Route fallback redirect |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/pages/folder-detail-page.tsx` | Topic click param sanitization |

---

## 6. Implementation & Quality Verification Checklist

- [x] `vocab_seed_versions` table created and populated on seed execution.
- [x] `Foundation English` seeds 875+ words cleanly (no `0/0` word count).
- [x] 100% of images in `vocab_folders`, `vocab_flashcards`, and `vocab_words` point to `res.cloudinary.com`.
- [x] Route `/vocabulary/folders/[id]/topics` handles missing topic params gracefully without 404.
- [x] `tsc --noEmit` passes with 0 errors in both backend and frontend.

---

## 7. Risks & Technical Considerations

- Cloudinary API quota: Image upload pipeline checks if URL already starts with `res.cloudinary.com` to prevent redundant network uploads.
