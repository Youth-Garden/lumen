# Feature Plan: System Vocabulary Folders & Thematic Sub-Topic Architecture

> **Status**: In Review
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-24
> **Target Module**: `backend/src/contexts/vocabulary/infrastructure/seed/`, `frontend/apps/web/src/features/vocabulary/components/cards/folder-card.tsx`

---

## 1. Overview & Objectives

This feature establishes concise, human-friendly names and dedicated high-quality Unsplash cover images for all system vocabulary folders, while fixing sub-topic word distribution across system datasets.

### Key Business & Educational Objectives:
1. **Concise & Standardized System Folder Naming**:
   - Replace long redundant titles with clean, meaningful folder names:
     - `ngsl-core`: **Tiếng Anh giao tiếp (NGSL)** / **General English (NGSL)**
     - `tsl-toeic`: **Từ vựng TOEIC (TSL)** / **TOEIC Vocabulary (TSL)**
     - `nawl-academic`: **Tiếng Anh học thuật (NAWL)** / **Academic English (NAWL)**
     - `bsl-business`: **Tiếng Anh thương mại (BSL)** / **Business English (BSL)**
     - `ngsl-spoken`: **Tiếng Anh đàm thoại (NGSL-S)** / **Spoken English (NGSL-S)**
     - `ndl-foundation`: **Tiếng Anh nền tảng (NDL)** / **Foundation English (NDL)**
2. **Dedicated Unsplash Cover Images for Every System Folder**:
   - Every system folder MUST have its own high-resolution Unsplash cover image reflecting its domain (communication, TOEIC, academic, business, spoken, foundation).
   - Avatar-style generated patterns (`getFolderCoverUrl`) are strictly reserved for custom user folders (`isUserFolder === true`).
3. **Perfect Even Word Distribution Across Sub-Topics**:
   - Fix topic partitioning algorithm: `itemsPerTopic = Math.ceil(totalRows / subTopics.length)` so that words in each folder are evenly divided across 5 to 12 sub-topics (150–230 words per sub-topic).
   - Re-assign sub-topics for all existing words in database to eliminate giant monolithic topics.

---

## 2. Requirements & Scope

### Functional Requirements
- [ ] **System Folder Naming & Category Standard (`ngsl-datasets.config.ts`)**:
  - Update `NGSL_DATASETS` definitions with clean, concise titles in English & Vietnamese.
- [ ] **Dedicated System Folder Cover Map (`folder-card.tsx`)**:
  - Register dedicated Unsplash image URLs in `FOLDER_COVERS` for all system folders.
  - Fallback avatar patterns (`getFolderCoverUrl`) are ONLY applied if `isSystem === false` and no custom cover is uploaded.
- [ ] **Sub-Topic Distribution Algorithm (`assignSubTopic`)**:
  - Calculate `itemsPerTopic` based on total dataset count:
    ```ts
    const itemsPerTopic = Math.max(1, Math.ceil(totalRows / subTopics.length));
    const targetIdx = Math.min(Math.floor(index / itemsPerTopic), subTopics.length - 1);
    ```
- [ ] **Sub-Topic Image & Vietsub Completeness**:
  - Every sub-topic possesses a localized Vietnamese title (`topicVi`) and Unsplash cover image (`topicImageUrl`).

### Non-Functional Requirements
- **Performance**: Batch DB updates complete in < 10 seconds.
- **Type Safety**: 0 `any` type bypasses in seeder and card components.
- **UI Aesthetics**: High-resolution Unsplash photography with dark gradient overlays for maximum contrast.

---

## 3. UI/UX Specifications (Frontend)

- **System Folder Cards (`folder-card.tsx`)**:
  - Displays dedicated Unsplash photography.
  - Dark gradient overlay ensures high legibility for white folder titles and stats pills.
- **Sub-Topic Grid View (`folder-topic-grid.tsx`)**:
  - Renders 5 to 12 evenly-sized 3D sub-topic cards per folder.
  - Standalone 3D avatar rings with Unsplash cover photos.
  - Hovering topic cards preserves `text-foreground` without text color changes.

---

## 4. System Folder Cover Image Mapping Matrix

| Dataset ID | Folder Name (VI / EN) | Dedicated Unsplash Cover Image URL |
| :--- | :--- | :--- |
| `ngsl-core` | Tiếng Anh giao tiếp (NGSL) / General English | `https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=80` |
| `tsl-toeic` | Từ vựng TOEIC (TSL) / TOEIC Vocabulary | `https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80` |
| `nawl-academic` | Tiếng Anh học thuật (NAWL) / Academic English | `https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80` |
| `bsl-business` | Tiếng Anh thương mại (BSL) / Business English | `https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80` |
| `ngsl-spoken` | Tiếng Anh đàm thoại (NGSL-S) / Spoken English | `https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80` |
| `ndl-foundation` | Tiếng Anh nền tảng (NDL) / Foundation English | `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80` |

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `backend/src/contexts/vocabulary/infrastructure/seed/ngsl-datasets.config.ts` | Update concise folder names and sub-topic image configs |
| `[MODIFY]` | `backend/src/contexts/vocabulary/infrastructure/seed/ngsl-seeder.service.ts` | Update existing folder entities and re-run sub-topic assignment |
| `[MODIFY]` | `frontend/apps/web/src/features/vocabulary/components/cards/folder-card.tsx` | Add dedicated Unsplash covers for system folders |
| `[DELETE]` | `backend/src/check-db.ts` | Remove scratch file after verification |

---

## 6. Implementation & Quality Verification Checklist

- [ ] Execute `cmd /c npx ts-node -r tsconfig-paths/register src/seed-ngsl-vocabulary.ts` in `backend`.
- [ ] Verify each system folder displays a unique Unsplash cover image on the web UI.
- [ ] Verify each system folder contains 5 to 12 sub-topics with ~150-230 words per sub-topic.
- [ ] Backend build check: `cmd /c npx tsc --noEmit` in `backend` passes with 0 errors.
- [ ] Frontend build check: `cmd /c npx tsc --noEmit` in `frontend/apps/web` passes with 0 errors.
