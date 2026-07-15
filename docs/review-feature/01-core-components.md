# Core Review Components

This document specifies the core user interface components for the post-exam review system.

---

## 1. Test Result Dashboard

The Test Result Dashboard acts as the entry point after a test is completed and is available in the user's history.

### 1.1 Immediate Results Screen
*   **Target Metrics**:
    *   Overall score and accuracy percentage.
    *   Total time spent versus allowed time.
    *   Breakdown of Answers: Correct (Green), Incorrect (Red), Skipped (Gray).
*   **Performance Analytics**:
    *   Visual distribution charts of performance by category, question type, or TOEIC part.
*   **User Action Triggers**:
    *   `Review Now` button: Launches the Question-by-Question Review flow.
    *   `Save for Later` button: Saves progress and returns to the dashboard home page.

### 1.2 Historical Results List
*   **Attempt History Log**:
    *   Chronological list of all attempts per test.
    *   Columns: Date & Time, Score, Accuracy %, Duration.
*   **Filtering & Searching**:
    *   Filter by course, TOEIC part, or score range.
*   **Side-by-Side Comparison**:
    *   Compare two selected attempts showing delta improvement in accuracy, time distribution, and specific question types.

---

## 2. Question-by-Question Review Panel

The primary user interface for step-by-step evaluation of the completed exam.

```
+------------------------------------------------------------------------+
| [Header] Test: TOEIC Practice 1  | Progress: [=======>       ] 15/50    |
+------------------------------------+-----------------------------------+
|                                    | [Sidebar]                         |
|  [Audio Playback: Speed 1.0x]       |  Question Sheet Grid              |
|                                    |  +---+ +---+ +---+ +---+          |
|  28. What kind of ink does...?     |  | 1 | | 2 | | 3 | | 4 |          |
|                                    |  | G | | R | | G | | G |          |
|  (A) He's a world-famous sprinter. |  +---+ +---+ +---+ +---+          |
|  (B) Consult the manual.           |  Note Panel                       |
|  (C) It's very kind of you to say. |  +-----------------------------+  |
|                                    |  | Category: [Grammar  v]      |  |
|  Your Answer: [C] (Incorrect)      |  | [ Write a note...        ] |  |
|  Correct Answer: [B]               |  |                             |  |
|                                    |  |                [Save Note]  |  |
|  [Show Explanation v]              |  +-----------------------------+  |
|  Grammar rules and definitions     |                                   |
|                                    |                                   |
+------------------------------------+-----------------------------------+
|  [<- Previous]                                           [Next ->]     |
+------------------------------------------------------------------------+
```

### 2.1 Sequential & Direct Navigation
*   **Sequential Controls**: `Previous` and `Next` buttons with keyboard shortcuts (`ArrowLeft` / `ArrowRight`).
*   **Question Indicator**: A progress bar showing how many questions have been reviewed (e.g., "15 of 50").
*   **Quick-Jump Grid**: A sidebar grid displaying all question numbers colored by status (Correct = Green, Incorrect = Red, Skipped = Gray). Clicking a number loads that question instantly.

### 2.2 Question Details Display
*   **Question Text / Media**: Full context display including reading passages, images, and audio controls.
*   **Response Summary**:
    *   Visual checkmarks/crosses next to user choices.
    *   If correct: User selection highlighted in green.
    *   If incorrect: User selection highlighted in red, correct answer highlighted in green.
*   **Difficulty & Timing**: Displays difficulty tier (Easy, Medium, Hard) and time spent on the question.

---

## 3. Answer Status Indicators

Unified color code rules applied globally across dashboards, review grids, and result histories:

| Color | Hex (Dark Mode) | Hex (Light Mode) | Meaning |
| :--- | :--- | :--- | :--- |
| 🟢 Green | `#10B981` | `#059669` | Correct answer / Resolved |
| 🔴 Red | `#EF4444` | `#DC2626` | Incorrect answer |
| ⚫ Gray | `#6B7280` | `#4B5563` | Skipped/Not attempted |
| 🟡 Yellow | `#F59E0B` | `#D97706` | Partially correct |

---

## 4. Audio/Listening Review Controller

Enhanced audio player dedicated to Listening sections (TOEIC Parts 1-4).

*   **Speed Playback Modulator**: Custom speed selector supporting `0.75x`, `1.0x`, `1.25x`, and `1.5x`.
*   **Transcript Syncing**: Accordion panel that expands to show the transcript. Highlight words or phrases synchronized with audio playback timestamps (if transcripts are annotated).
*   **Segment Replay**: Ability to replay specific audio sections corresponding to a single question group.
