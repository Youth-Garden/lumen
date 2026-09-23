# Feature Plan: Vocabulary Audio CDN & Pronunciation Architecture

> **Status**: Completed
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-22
> **Target Module**: backend/src/contexts/vocabulary & backend/src/seed-toeic.ts

---

## 1. Overview & Objectives

In the current system, vocabulary audio playback was intermittently failing with browser network warnings (`Provisional headers are shown` / CORS blocking) because `audioUsUrl` was seeded with third-party URLs (`audio.tflat.vn`). Third-party platforms block cross-origin requests, have rate limits, and cause latency.

Furthermore, Cloudinary already holds 1,216 audio assets (608 US audio files in `lumen/vocabulary/audio/` and 608 UK audio files in `lumen/vocabulary/audio/uk/`). However, the database records lacked correct Cloudinary URLs for `audioUsUrl` and `audioUkUrl`.

### Key Objectives:
1. **Eliminate All Third-Party Hotlinks**: Replace all `tflat.vn` or unverified external audio URLs with self-hosted Cloudinary CDN URLs (`res.cloudinary.com`).
2. **Organize Audio Assets**:
   - US Pronunciations: `lumen/vocabulary/audio/us/[term].mp3` (or `lumen/vocabulary/audio/[term].mp3`)
   - UK Pronunciations: `lumen/vocabulary/audio/uk/[term].mp3`
3. **Automated Dictionary Fetch & CDN Pipeline**: For any new vocabulary terms added dynamically, fetch high-quality audio files from standard dictionary APIs (e.g. Free Dictionary API / Oxford / Cambridge) and upload to Cloudinary/S3 storage so audio sources are always 100% owned, reliable, and instantaneous.
4. **Seed & Migration Script**: Update `seed-toeic.ts` and `upload-vocabulary-cloudinary.ts` to sync both US and UK Cloudinary audio URLs into PostgreSQL (`audioUrl`, `audioUsUrl`, `audioUkUrl`).

---

## 2. Requirements & Scope

### Functional Requirements
- [x] **Database Audio Mapping**: Populate `audioUsUrl` and `audioUkUrl` for all 608 vocabulary words using secure Cloudinary CDN URLs.
- [x] **Seed Script Alignment**: Update `seed-toeic.ts` to NEVER store raw `tflat.vn` URLs. Automatically map to Cloudinary CDN paths.
- [x] **Audio Fallback Chain**: Ensure the frontend pronunciation player tries high-priority CDN audio first (`audioUsUrl` / `audioUkUrl`), falls back to generic `audioUrl`, and only uses browser `SpeechSynthesis` if no remote file is available.
- [x] **Cloudinary Audio Folder Structure**: Ensure clear segregation between US (`lumen/vocabulary/audio/`) and UK (`lumen/vocabulary/audio/uk/`).

### Non-Functional Requirements
- **Instant Playback (Latency < 100ms)**: Cloudinary global CDN edge caching ensures immediate audio response without CORS or hotlinking blocks.
- **Reliability & Availability**: 100% uptime with no 403 Forbidden or aborted requests.
- **Strict Type Safety**: All repository and entity methods strongly typed (`string | null`).

### Out of Scope
- Real-time client-side voice recording analysis (STT/speech grading).

---

## 3. UI/UX Specifications (Frontend)

- **Audio Playback UX**:
  - Immediate audio playback on first click (0ms leading-edge trigger).
  - 350ms cooldown prevents audio overlapping/spam.
  - US & UK buttons visually indicate accent flags (`US` with primary badge, `UK` with sky badge).

---

## 4. Architecture & Technical Contracts

### Backend (NestJS / TypeORM / Cloudinary)
- **Entity**: `WordEntity` with columns `audioUrl` (varchar), `audioUsUrl` (varchar), `audioUkUrl` (varchar).
- **Cloudinary Asset Paths**:
  - US Audio: `https://res.cloudinary.com/<cloud_name>/video/upload/lumen/vocabulary/audio/<term>.mp3`
  - UK Audio: `https://res.cloudinary.com/<cloud_name>/video/upload/lumen/vocabulary/audio/uk/<term>.mp3`
- **Dynamic Ingestion Service**: `DictionaryAudioHelper` fetches pronunciation URLs from dictionary APIs and streams to Cloudinary before saving words.

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[NEW]` | `documents/features/vocabulary-audio-cdn-and-pronunciation-sync.md` | Feature planning and architecture document |
| `[MODIFY]` | `backend/src/upload-vocabulary-cloudinary.ts` | Upload and sync US and UK audio assets to Cloudinary folders and database |
| `[MODIFY]` | `backend/src/seed-toeic.ts` | Map vocabulary audio URLs strictly to Cloudinary CDN instead of legacy TFlat URLs |
| `[MODIFY]` | `backend/src/contexts/vocabulary/infrastructure/helpers/dictionary-audio.helper.ts` | Dictionary audio enrichment helper with Cloudinary streaming pipeline |

---

## 6. Implementation & Quality Verification Checklist

- [x] All 608 words have valid Cloudinary `audioUsUrl` and `audioUkUrl` in PostgreSQL.
- [x] 0 words contain `tflat.vn` URLs in the database.
- [x] `seed-toeic.ts` successfully seeds with Cloudinary CDN URLs.
- [x] Frontend plays both US and UK pronunciations seamlessly from Cloudinary CDN without CORS/abort errors.
- [x] `npx tsc --noEmit` on backend passes with 0 errors.
- [x] `pnpm --filter web test` on frontend passes 100%.

---

## 7. Risks & Technical Considerations

- **Cloudinary Rate Limits**: Batch asset lookups using pagination cursor (`next_cursor`) or prefix mapping rather than individual HTTP requests.
- **Sanitized Filenames**: Terms containing hyphens, spaces, or special characters (e.g. `abide by` -> `abide_by`) must follow standard snake_case naming convention on Cloudinary.
