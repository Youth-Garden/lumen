# Note-Taking System

This document specifies the features, user interface, and integrations for the in-context personal note-taking tool.

---

## 1. In-Context Notes Sidebar

*   **Location**: Side panel adjacent to the question review panel, which can be toggled open or closed.
*   **Auto-Save Behavior**: Debounced auto-save (e.g., 500ms after user stops typing) with a visual status indicator ("Saving...", "Saved").
*   **Properties**:
    *   **Content**: Markdown text input.
    *   **Category**: Dropdown selector (`Grammar`, `Vocabulary`, `Test Strategy`, `Personal Reminder`).
    *   **Tags**: Ability to type custom hashtags (e.g., `#Part5`, `#Prepositions`).
    *   **Context Binding**: Automatically associates the note with the specific `attempt_id`, `question_id`, and `test_id`.

---

## 2. Note Management Dashboard

Users can access all notes they have taken across the platform in a centralized dashboard.

### 2.1 Viewing and Searching
*   **Global Filter**: Filter notes by Course, Test, Category, Tag, and Creation Date.
*   **Keyword Search**: Full-text search across all note contents.
*   **Jump-to-Context**: Each note includes a link: "Review Question". Clicking it redirects the user directly to the corresponding test review view, focusing on the specific question.

### 2.2 Editing & Organization
*   **Inline Editing**: Modifying notes directly from the search list.
*   **Delete**: Confirmation modal before deleting notes.
*   **Export Options**: Export selected notes as PDF or plain text (`.txt` / `.md`).

---

## 3. Integration with Learning Paths

*   **Pre-Retake Study Deck**: When starting a retake attempt, the system prompts the user: *"Would you like to review your 8 notes from the last attempt before starting?"*.
*   **Vocabulary Syncing**: Vocabulary notes can be exported directly into flashcards.
