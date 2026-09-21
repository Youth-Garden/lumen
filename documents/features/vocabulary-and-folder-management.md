# Feature Specification: Vocabulary & Folder Management

> **Module**: `frontend/apps/web/src/features/vocabulary` + `backend/src/contexts/vocabulary`
> **Status**: Verified & Implemented
> **Author**: Antigravity Pair Programming
> **Last Updated**: 2026-09-21

---

## 1. Overview & Hierarchy

Lumen organizes vocabulary into structured collections:
1. **Folders**: High-level decks representing certifications, academic sets, or user-created collections.
2. **Topics**: Sub-categories or thematic groups within a Folder (e.g. "Contracts", "Marketing", "Travel"). Custom user folders allow direct word assignment without requiring explicit topics.
3. **Vocabulary Words & Flashcards**: Individual terms with definitions, phonetics, parts of speech, CEFR levels, and audio pronunciations.

---

## 2. System Folders vs. Custom Folders

| Dimension | System Folders | Custom Folders |
| :--- | :--- | :--- |
| **Author** | System Admin / Pre-seeded | Authenticated User (`authorId = userId`) |
| **Categorization** | Categorized into Tiers (`General`, `Exam`, `Grammar`, etc.) | Grouped in the "My Folders" / Custom tab |
| **Multilingual Support** | `name`, `description`, `category` stored as `I18nString` (`{ en: '...', vi: '...' }`) | Simple strings or localized objects |
| **Topic Requirement** | Mandatory topic groupings | Optional (words can be added directly) |
| **Modification Rights** | Read-only for regular users | Full CRUD (Create, Edit Name/Desc, Delete) |

---

## 3. Folder List Page & Lazy Loading by Tier Tabs

The Folder List page (`/vocabulary/folders`) partitions folders into category tabs with lazy evaluation:
- Tabs: `ALL`, `GENERAL`, `EXAM`, `BUSINESS`, `ACADEMIC`, `CUSTOM`.
- Only folders matching the selected active tab are rendered in the viewport, preventing DOM bloat.
- Empty states feature action buttons to switch tabs or create a new custom folder.

---

## 4. Word Detail Sheet & Bookmark to Folder Flow

### A. Word Detail Sheet
- Triggerable anywhere in the app (Folder detail, word list, or mid-study by tapping the term).
- Displays phonetics, CEFR badge, US/UK audio buttons, parts of speech, definitions, example sentences, and current SRS mastery progress.

### B. Add to Custom Folder Dialog / Sheet
- Users can bookmark any vocabulary word into their custom folders.
- Displays a checklist of the user's custom folders with quick-create folder action.
- Automatically handles folder-flashcard associations via `CreateFlashcardCommand`.
