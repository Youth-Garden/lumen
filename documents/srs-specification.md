# Spaced Repetition System (SRS) Specification

> **Source of Truth**: This document defines the core mechanics, data structures, and algorithms for the Spaced Repetition System (SRS) and distractor generation logic in the Lumen platform.
> Any changes to SRS logic must be synchronized with this document.

---

## 1. Data Schema

```typescript
interface UserWordProgress {
  userId: string;
  wordId: string; // or flashcardId depending on mapping

  // Display status
  masteryScore: number; // Actual mastery percentage: 0.0 -> 100.0 (%)
  level: number; // 0: Unlearned | 1..4: Learning | 5: Mastered
  isWilted: boolean; // true: Due for review (Needs watering / Plant wilted)

  // Interval & SRS calculation metrics
  learningStep: number; // Counter for Level 0→1 transition: accumulated 0 -> 6 correct attempts
  intervalDays: number; // Days interval until the next scheduled review

  // Timestamps
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
}
```

---

## 2. Retention Stage Hierarchy & Plant Growth Metaphor

| Level | Stage Name | Mastery Score | Icon Metaphor | Lit Bars | Interval Days |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **0** | Unlearned | 0% | Unplanted Seed | 0 / 5 | N/A |
| **1** | Beginner | 1% – 20% | Sprouted Seed | 1 / 5 | 4 hours (0.16d) |
| **2** | Developing | 21% – 40% | Growing Sapling | 2 / 5 | 1 day |
| **3** | Retaining | 41% – 60% | Two-leaf Plant | 3 / 5 | 3 days |
| **4** | Memorized | 61% – 80% | Budding Flower | 4 / 5 | 7 days |
| **5** | Mastered | 81% – 100% | Blooming Sunflower | 5 / 5 | 30d → doubled on success |

---

## 3. New Word Learning & Promotion Logic (Forward Progression)

### 3.1. Seed Planting Phase (Level 0 → Level 1)

- Requires a cumulative total of **6 correct answers** (persisted across sessions in database).
- On each correct answer:
  ```text
  learningStep += 1
  masteryScore = min(20, learningStep * (20 / 6))
  ```
- When `learningStep >= 6`:
  ```text
  level = 1
  masteryScore = 20%
  nextReviewAt = now + 4 hours
  ```

### 3.2. Periodic SRS Review Phase (Level 1 → Level 5)

| Transition | Required Correct Reviews | New Mastery Score | Next Interval Days |
| :---: | :---: | :---: | :---: |
| **Level 1 → 2** | 2 valid reviews | 40% | 1 day |
| **Level 2 → 3** | 2 valid reviews | 60% | 3 days |
| **Level 3 → 4** | 1 valid review | 80% | 7 days |
| **Level 4 → 5** | 1 valid review | 100% | 30 days |

> **Valid Review**: Answering correctly when `current_time >= nextReviewAt`.

### 3.3. Fast-Track Evaluation Shortcuts

| Action | Resulting State |
| :--- | :--- |
| **"Temporary Memory"** | `level = 2`, `masteryScore = 40%`, `nextReviewAt = now + 1 day` |
| **"Already Known"** | `level = 5`, `masteryScore = 100%`, `nextReviewAt = now + 30 days` |

---

## 4. Wilted Mechanics & Incorrect Answer Penalties

### 4.1. Wilted Status (`isWilted`)

- Trigger: `current_time >= nextReviewAt` → `isWilted = true`.
- No automatic score deduction occurs until the user actually enters a review session.

### 4.2. Review Session Outcomes ("Watering the Plant")

**Correct Answer:**
- `isWilted = false`
- Advance level according to table in Section 3.2.
- For Level 5 words answered correctly: `intervalDays = min(180, intervalDays * 2)`.

**Incorrect Answer:**
```text
masteryScore = max(0, masteryScore - 20%)
level = floor(masteryScore / 20)
intervalDays = 0.16 (4 hours)
nextReviewAt = now + 4 hours
```

---

## 5. Question Generation & Distractor Fallback Hierarchy

For multiple-choice exercises (`CHOICE_TERM`, `CHOICE_MEANING`), the engine **MUST** generate exactly **4 distinct choices** sourced from genuine database vocabulary according to the strict fallback hierarchy:

1. **Priority 1 (Same Topic)**: Select random distinct words from the current Topic pool.
2. **Priority 2 (Same Folder)**: If the topic has fewer than 3 distractors, select additional words from the parent Folder.
3. **Priority 3 (System Vocabulary DB)**: If the folder has fewer than 3 distractors, fill remaining slots from the system-wide Vocabulary bank.

> **Rule**: Never fabricate mock or random placeholder strings. Exactly 4 real options are required.

---

## 6. Real-time Metrics & Overview API

- Endpoint `GET /vocabulary/overview` returns the `dueCount` metric computed directly via indexed database query (`(userId, nextReviewAt)`).
- Frontend UI consumes `dueCount` from the Overview API for badges and KPI widgets, avoiding calling `/due` full list queries for simple counting.

---

## 7. State Machine Diagram

```text
[Level 0: Unlearned]
       │
       ▼ (6 Cumulative Correct Answers)
[Level 1: Beginner (1 bar, 20%)] ── After 4 hrs ──► [Wilted]
       │                                              │
       ├──────── 2 Valid Correct Reviews ◄────────────┘
       ▼
[Level 2: Developing (2 bars, 40%)] ── After 1 day ──► [Wilted]
       │                                                 │
       ├──────── 2 Valid Correct Reviews ◄───────────────┤
       │                                            ▼ (Wrong)
       │                                       Demote to Level 1
       ▼
[Level 3: Retaining (3 bars, 60%)] ── After 3 days ──► [Wilted]
       │                                                 │
       ├──────── 1 Valid Correct Review ◄────────────────┤
       │                                            ▼ (Wrong)
       │                                       Demote to Level 2
       ▼
[Level 4: Memorized (4 bars, 80%)] ── After 7 days ──► [Wilted]
       │                                                 │
       ├──────── 1 Valid Correct Review ◄────────────────┤
       │                                            ▼ (Wrong)
       │                                       Demote to Level 3
       ▼
[Level 5: Mastered Sunflower (5 bars, 100%)] ─ 30d ──► [Wilted]
       │                                                 │
       ├──────── Correct: interval * 2 (max 180d) ◄──────┤
       │                                            ▼ (Wrong)
       └──────────────────────────────────────── Demote to Level 4
```
