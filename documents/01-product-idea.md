# Product Idea Document — Lumen

## 1. Overview

**Project Name:** Lumen

**One-sentence Description:** Lumen is a comprehensive English learning web platform combining certification prep (IELTS, TOEIC), grammar & vocabulary foundation building, and speaking & listening practice — personalized to each learner's level and goals.

**Problem Statement:**

- English learners in Vietnam often have to use fragmented tools: a vocabulary app, a listening app, a test prep center, a pronunciation checking app — there is no single place that aggregates everything and personalizes the learning path.
- Speaking/Writing practice lacks immediate feedback without a tutor — most self-learners don't know where they went wrong.
- Learning content is not closely tied to specific goals (e.g., needing TOEIC 650 for graduation, IELTS 6.5 for studying abroad) causing learners to waste time learning aimlessly.

## 2. Target Audience

Initial target: **all audiences**, but operated through clear personas for personalization:

| Persona                           | Main Goal                                                | Feature Priority                             |
| --------------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| Students                          | Grammar & vocabulary foundation according to curriculum  | Grammar, Vocabulary                          |
| Working Professionals (Test Prep) | Achieve certification scores within a specific timeframe | Mock tests, AI grading, score tracking       |
| Beginners (Lost Basics)           | Build foundation from A1                                 | Step-by-step learning path, no exam pressure |
| Real-world Communication Seekers  | Natural listening and speaking, reflexes                 | Speaking practice, Listening, Shadowing      |

Classification mechanism: **Placement test** upon registration, suggesting a suitable learning path instead of imposing a one-size-fits-all approach.

## 3. Scope of Features

### 3.1. Test Prep (IELTS, TOEIC...)

- Mock test bank, automatic grading for multiple-choice sections (Listening, Reading)
- AI grading for Writing/Speaking — preliminary grading based on band criteria + specific correction suggestions
- Score tracking over time (band score tracker / score prediction)
- Weakness analysis by question type (e.g., weak at "matching headings" in IELTS Reading)

### 3.2. Grammar & Vocabulary

- Lessons by CEFR levels (A1–C2)
- Vocabulary intake with interactive Flashcards for initial word discovery and baseline level self-assessment
- Continuous Spaced Repetition and review powered by interactive exercises & mini-games (multiple-choice term/meaning, typing, listening) — no passive flashcards during review
- Folders & Topics serving as intake boundaries/scopes for introducing new words over targeted periods
- Integrated dictionary: definitions, phonetics, audio, examples, Vietnamese meanings


### 3.3. Listening & Speaking

- Audio lessons with bilingual subtitles, adjustable playback speed
- Speaking practice with AI: recording → speech-to-text → pronunciation, fluency, and intonation grading
- Shadowing (listen and repeat)
- (Later phase) Speaking practice rooms pairing real users

## 4. MVP — Phase 1 Scope

Prioritize easy-to-implement features with quick value and low operational costs before investing in complex AI:

1. Registration/login, placement test
2. Basic Vocabulary & Grammar module (CEFR A1–B2)
3. One mock test set (TOEIC or IELTS Reading/Listening — auto-graded, no complex AI needed)
4. Basic progress tracking dashboard

**For Phase 2 (requires AI integration, higher operational costs):**

- AI grading for Writing/Speaking
- Speaking practice with detailed pronunciation feedback
- AI-personalized learning paths

## 5. Business Model (To be finalized early)

- **Freemium**: free basic lessons (vocabulary, grammar), paid subscriptions for:
  - Unlimited mock tests
  - AI grading for Writing/Speaking
  - Personalized learning paths
- Goal-specific packages (e.g., "3-Month IELTS Package", "Crash TOEIC Package")
- Needs to be finalized early as it directly affects the design of free vs. paid limits in the system.

## 6. Content Resources

### Vocabulary Data by Level

- CEFR-J Wordlist (free for commercial use, requires attribution)
- Words-CEFR-Dataset (GitHub, packaged into Python library `cefrpy`)
- Oxford 5000 (reference structure, do not copy verbatim — copyrighted)

### Definition/Pronunciation API

- Free Dictionary API (dictionaryapi.dev) — free, no key needed, for MVP
- Merriam-Webster API — free for non-commercial use (limit 1000 requests/day), requires separate agreement for commercialization
- WordsAPI — can purchase full dataset to self-host, avoiding rate limits

### Test Prep Content

- Self-compile vocabulary by exam topics (reference structures from sources: TOEIC office topics like Contracts, Marketing, Finance, HR...)
- Sample tests must be self-compiled or licensed — **do not use real copyrighted tests directly** (Cambridge, ETS...)

## 7. Risks & Early Decisions Needed

| Issue                         | Decision Needed                                                        |
| ----------------------------- | ---------------------------------------------------------------------- |
| Test copyrights               | Self-compile or purchase licenses from test prep entities?             |
| AI costs for Speaking/Writing | Which API to use (cost per call), what are the free tier limits?       |
| UI Language                   | Vietnamese only or multi-language support for future market expansion? |
| User Data                     | Compliance regarding voice recordings (sensitive data)                 |

## 8. Overall Roadmap

| Phase         | Estimated Time | Core Content                                       |
| ------------- | -------------- | -------------------------------------------------- |
| Phase 1 (MVP) | Months 1–4     | Vocabulary/grammar, 1 mock test, placement test    |
| Phase 2       | Months 5–7     | AI Speaking/Writing grading, expand test bank      |
| Phase 3       | Months 8–10    | Advanced listening/speaking, AI personalized paths |
| Phase 4       | Future         | Mobile app, practice community, gamification       |

---

_Related Documents: see `02-architecture-deployment-ddd.md` for detailed technical architecture of Lumen._
