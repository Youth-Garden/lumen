# Feature Plan: NGSL Vocabulary Topic Architecture — Refined

> **Status**: Completed
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-24
> **Target Module**: `backend/src/contexts/vocabulary/infrastructure/seed/ngsl-datasets.config.ts`

---

## 1. Overview & Objectives

Refine the NGSL seeding pipeline to fix three concrete problems:

1. **Folder names too long** — current names include acronyms in parentheses. Names should be short and punchy.
2. **Images duplicated across datasets** — audit found **20 duplicate Unsplash photo IDs** reused across different folders/topics. Every topic must have a globally unique image.
3. **Reuse existing image when topic name is identical** — if a topic name already has an image assigned, keep it. Only replace duplicates.

---

## 2. Problems Found

### 2.1 Duplicate Photo IDs (20 total)

| Photo ID | Count | Used in |
| :--- | :--- | :--- |
| photo-1456513080510 | 3x | NGSL (Libraries), NAWL (Research), fallback |
| photo-1506784983877 | 3x | NGSL (Routines), NGSL-S (Memories), NDL (Rooms) |
| photo-1450133064473 | 2x | TSL (Contracts), BSL (Contract Negotiations) |
| photo-1460925895917 | 2x | TSL (Digital Marketing), BSL (Digital Marketing CRM) |
| photo-1474511320723 | 2x | NGSL (Flora), NDL (Pets) |
| photo-1488646953014 | 2x | NGSL (City), NGSL-S (Directions) |
| photo-1499209974431 | 2x | NGSL (Personality), NGSL-S (Reactions) |
| photo-1507413245164 | 2x | NGSL (Morals), NAWL (Frameworks) |
| photo-1507679799987 | 2x | TSL (Leadership), NAWL (Abstract) |
| photo-1509718443690 | 2x | NGSL (Time), NDL (Shapes) |
| photo-1513151233558 | 2x | NGSL (Home), NDL (Family) |
| photo-1521737711867 | 2x | TSL (Recruitment), BSL (Talent) |
| photo-1522071820081 | 2x | NGSL (Workplace), BSL (Mediation) |
| photo-1529156069898 | 2x | NGSL (Family), NGSL-S (Parting) |
| photo-1554224155 | 2x | TSL (Accounting), BSL (Financial Reporting) |
| photo-1556761175 | 2x | BSL (Client Prospecting), NGSL-S (Consensus) |
| photo-1578575437130 | 2x | TSL (Freight), BSL (International Trade) |
| photo-1581291518857 | 2x | BSL (Quality), NDL (Numbers) |
| photo-1586528116311 | 2x | TSL (Supply Chain), BSL (Cross-Border) |
| photo-1589829545856 | 2x | TSL (Legal), BSL (Corporate Law) |

### 2.2 Folder Name Changes

| Dataset ID | Old Name (EN) | New Name (EN) | New Name (VI) |
| :--- | :--- | :--- | :--- |
| ngsl-core | Essential General English (NGSL) | General English | Tieng Anh giao tiep |
| tsl-toeic | TOEIC Service List (TSL) | TOEIC Advanced | Tu vung TOEIC nang cao |
| nawl-academic | New Academic Word List (NAWL) | Academic English | Tieng Anh hoc thuat |
| bsl-business | Business Service List (BSL) | Business English | Tieng Anh thuong mai |
| ngsl-spoken | Spoken & Conversational English (NGSL-S) | Spoken English | Tieng Anh dam thoai |
| ndl-foundation | New Dolch Foundation (NDL) | Foundation English | Tieng Anh nen tang |

---

## 3. Image Replacement Strategy

**Rule**: Keep existing image URL if the topic name matches a previously-seeded topic exactly.
Only replace the SECOND (or later) occurrence of a duplicate photo ID.

### Replacements — NAWL
- Topic 6 (Abstract Concepts & Epistemology): replace 1507679799987 -> photo-1516796181074

### Replacements — NGSL Core
- Topic 12 (Libraries, Exams & Self-Study): replace 1456513080510 -> photo-1497436072909

### Replacements — BSL
- Topic 3 (Financial Reporting): replace 1554224155 -> photo-1543286386713
- Topic 5 (International Trade): replace 1578575437130 -> photo-1519003300449
- Topic 6 (Cross-Border Commerce): replace 1586528116311 -> photo-1494412574643
- Topic 8 (Quality Assurance): replace 1581291518857 -> photo-1504868584819
- Topic 10 (Contract Negotiations): replace 1450133064473 -> photo-1568992687947
- Topic 12 (Digital Marketing CRM): replace 1460925895917 -> photo-1432888498266
- Topic 13 (Talent Sourcing HR): replace 1521737711867 -> photo-1542744173-8e7e53415bb0
- Topic 14 (Workplace Mediation): replace 1522071820081 -> photo-1573496359142
- Topic 15 (Corporate Law): replace 1589829545856 -> photo-1575505586569

### Replacements — NGSL-S
- Topic 2 (Parting Words): replace 1529156069898 -> photo-1516979187457
- Topic 3 (Spontaneous Reactions): replace 1499209974431 -> photo-1552674605
- Topic 7 (Asking Directions): replace 1488646953014 -> photo-1476304884326
- Topic 10 (Childhood Memories): replace 1506784983877 -> photo-1518398046578
- Topic 12 (Consensus): replace 1556761175 -> photo-1582213782179

### Replacements — NDL
- Topic 2 (Shapes): replace 1509718443690 -> photo-1564419320461
- Topic 3 (Numbers): replace 1581291518857 -> photo-1606326608690
- Topic 5 (Family Members): replace 1513151233558 -> photo-1609220136736
- Topic 6 (Rooms, Beds): replace 1506784983877 -> photo-1555041469
- Topic 7 (Pets, Farm Animals): replace 1474511320723 -> photo-1425082661705

---

## 4. Implementation Checklist

- [x] Update folder names in ngsl-datasets.config.ts (6 datasets)
- [x] Replace all duplicate image URLs per dataset (see section 3)
- [x] Re-run seeder
- [x] Verify topic count per dataset in DB
- [x] Verify all image URLs are globally unique across config

---

## 5. Word-per-Topic Targets (validated)

| Dataset | Words | Topics | Words/Topic |
| :--- | :--- | :--- | :--- |
| ngsl-core | 2,807 | 24 | ~117 ✅ |
| tsl-toeic | 1,250 | 16 | ~78 ✅ |
| nawl-academic | 957 | 12 | ~80 ✅ |
| bsl-business | 1,744 | 16 | ~109 ✅ |
| ngsl-spoken | 719 | 12 | ~60 ✅ |
| ndl-foundation | ~875 | 12 | ~73 ✅ (CSV empty) |
