# Retest and Practice Features

This document specifies options for learners to retake exams, practice targeted concepts, and track iterative progress.

---

## 1. Retesting Architecture

Learning is highly reinforced when repeating tests after reviewing mistakes.

### 1.1 Retake Modes
*   **Retake Full Test**: Resets all answers and initiates a brand new test attempt.
*   **Retake Incorrect Only**: Generates a dynamic mini-quiz consisting only of questions the user got wrong in the selected attempt.
*   **Retake Specific Part**: Allows users to retake just Part 5 or Part 7 of a complete test.

### 1.2 Shuffling Controls
*   Questions and/or answer choices are shuffled dynamically during retakes to prevent users from simply memorizing letter options (A, B, C, D) without understanding the questions.

---

## 2. Side-by-Side Attempt Comparison

After a retake, the system provides a comparison interface to measure progress:

*   **Score Delta**: Shows absolute changes (e.g., "Score: 450 -> 680 (+230 points)").
*   **Question Status Transition Table**:
    *   *Improved*: Incorrect 🔴 -> Correct 🟢.
    *   *Regressed*: Correct 🟢 -> Incorrect 🔴 (signifies guessing or unstable knowledge).
    *   *Unchanged (Correct)*: Correct 🟢 -> Correct 🟢.
    *   *Unchanged (Incorrect)*: Incorrect 🔴 -> Incorrect 🔴 (signifies persistent gaps).
*   **Time Delta**: Highlights if the user answered faster on the second attempt.

---

## 3. Targeted Concept Practice

*   **"Practice Similar Questions"**: Generates a list of 5-10 questions from the question library that share the same tag (e.g., `#Gerunds` or `#Part3_Business_Trip`) and difficulty tier.
*   **Mastery Score**: Tracks confidence on specific concepts based on correct answer streaks.
