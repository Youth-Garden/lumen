# Explanation System

This document specifies the structure, management, and recommendations engine for explanations.

---

## 1. Multi-Format Explanation Structure

Explanations must help learners understand *why* their answers were wrong and *how* to solve similar problems.

### 1.1 Text Explanations (Rich Text)
*   **Core Content**: Detailed analysis of correct and incorrect choices.
*   **Pedagogical Content**:
    *   Grammar rules: Linking specific rules, parts of speech, syntax breakdowns.
    *   Vocabulary definitions: Words defined with phonetics, definitions, and example sentences.
    *   Key phrases: Common collocations, idioms, or patterns used in the question.

### 1.2 Media & Rich Content Support
*   **Images & Diagrams**: Annotated images displaying visual proof (specifically useful for TOEIC Part 1 Photos and Part 7 tables).
*   **Smart Links**: Hyperlinks pointing to related grammar lessons, vocabulary list decks, or reference documents in the platform.

---

## 2. Admin Content Management (Explanation Editor)

Admins/Teachers must be able to write and update explanations efficiently.

### 2.1 Editor Interface
*   **WYSIWYG Markdown Editor**: Rich-text component support (bold, italic, lists, highlight blockquotes, custom tables, code blocks).
*   **Media Uploader**: Direct image upload with drag-and-drop support (stored in Cloud Storage).
*   **Live Preview Panel**: Split-pane or toggleable window rendering the explanation exactly as it will appear on the learner's screen.
*   **Template Selector**: Standard formats for quick drafting (e.g., "Grammar Rule Template", "Listening Strategy Template").

### 2.2 Workflow & Operations
*   **Bulk Operations**: Assign the same explanation template to multiple questions (e.g., questions testing the same grammatical structure).
*   **Quality Control Dashboard**:
    *   Filters showing questions without explanations.
    *   Flagged explanations: Allows learners to report spelling errors, formatting issues, or incorrect explanations, which show up on the admin dashboard for revision.

---

## 3. Smart Recommendations Engine

Instead of static text, explanations should guide students to further practice.

*   **Rule-Based Mapping**: If a question tests a specific Tag (e.g., `#PassiveVoice`), the explanation panel will display a card: *"Struggling with Passive Voice? Review the grammar lesson [Passive Voice Module] or practice [5 similar questions]."*.
*   **Vocabulary Integration**: Any key vocabulary defined in the explanation can be added to the learner's personal vocabulary lists/flashcard deck directly with a one-click "+ Add to Flashcards" button.
