# TOEIC-Specific Features

This document specifies the custom settings, test configurations, and part-specific display systems built specifically for the TOEIC assessment mode.

---

## 1. Modular Part Selection

Rather than requiring a full 2-hour, 200-question test, learners can select individual parts to practice.

### 1.1 Part Definitions
*   **Part 1: Photographs** (6 questions) - Listening
*   **Part 2: Question-Response** (25 questions) - Listening
*   **Part 3: Conversations** (39 questions) - Listening
*   **Part 4: Talks** (30 questions) - Listening
*   **Part 5: Incomplete Sentences** (30 questions) - Reading
*   **Part 6: Text Completion** (16 questions) - Reading
*   **Part 7: Reading Comprehension** (54 questions) - Reading

### 1.2 Configuration Interface
*   **Checkbox selection**: Choose any combination (e.g., "Part 5 + Part 6").
*   **Targeted analytics**: View accuracy charts and averages split by Part.

---

## 2. Custom Time Limits

*   **Standard Time**: The system calculates the proportion of standard TOEIC time (e.g., 75 minutes for 100 Reading questions, ~45 seconds per question).
*   **Custom Limits**:
    *   **Timed Mode**: User enters a duration in minutes or selects a speed factor (e.g., 1.5x time for practice, 0.8x time for speed drills).
    *   **Untimed Mode**: Standard practice mode with no pressure, but active stopwatch to log actual duration per question.
*   **Visual Alert Nudges**:
    *   Soft green timer.
    *   Transitions to solid yellow at 5 minutes left.
    *   Flashing red at 1 minute remaining.

---

## 3. Part-Specific Review Interfaces

Each Part requires a tailored interface to present questions cleanly:

### 3.1 Listening Parts (1-4)
*   **Part 1**: Sidebar with high-resolution image, audio controls, and multiple-choice options.
*   **Part 2**: No passage or image. Display question card with audio playback and buttons for choices A, B, C.
*   **Part 3 & Part 4**: Dual-pane layout.
    *   *Left Panel*: Conversation audio and transcript accordion.
    *   *Right Panel*: Question group (typically 3 questions sharing the same audio).

### 3.2 Reading Parts (5-7)
*   **Part 5 & Part 6**:
    *   Fill-in-the-blanks passages.
    *   Explanation focuses on grammar rules, parts of speech, and vocabulary collocations.
*   **Part 7**: Split screen layout.
    *   *Left Panel*: Reading passage (single, double, or triple passages) with text highlight options.
    *   *Right Panel*: Associated questions. When reviewing, correct answers correspond to highlighted sections in the passage text on the left.

---

## 4. Score Estimation & Band Prediction

*   **Formula Engine**: Translates raw reading and listening correct counts to standard TOEIC scaled score bands (10 - 990 score range).
*   **Progress Charts**: Displays score estimation history trends to show how close the learner is to their target score (e.g., "Currently at 650, Goal is 750").
