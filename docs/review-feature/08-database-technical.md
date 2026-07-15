# Database Schema and API Technical Specifications

This document outlines the proposed database models and API endpoints required to support the Review & Learning Module on both the backend and frontend.

---

## 1. Database Schema (Prisma/TypeORM Style)

We will need new database collections/tables or modifications to existing ones to store attempts, explanations, notes, and progress.

### 1.1 `TestAttempt`
Stores logs of each complete or part-based test session.
```typescript
enum TestAttemptMode {
  FULL = 'FULL',
  PRACTICE = 'PRACTICE',
  PART = 'PART',
}

interface TestAttempt {
  id: string;               // UUID
  userId: string;           // Ref to User
  testId: string;           // Ref to ToeicTest / Quiz
  startedAt: Date;
  completedAt: Date | null;
  duration: number;         // Time spent in seconds
  score: number;            // Estimated scaled score
  accuracy: number;         // Percentage correct
  answers: QuestionResponse[]; // JSON array of user responses
  mode: TestAttemptMode;
  partsAttempted: number[]; // e.g., [5, 6] for Parts 5 and 6
}

interface QuestionResponse {
  questionId: string;
  selectedOption: string;   // e.g. "A", "B", "C", "D"
  isCorrect: boolean;
  timeSpent: number;        // Time spent on this specific question in seconds
  flaggedHard: boolean;     // If student marked it as hard
}
```

### 1.2 `Explanation`
Stores details explaining correct answers. Linked 1:1 or 1:N with Questions.
```typescript
enum ExplanationStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

interface Explanation {
  id: string;               // UUID
  questionId: string;       // Ref to Question
  content: string;          // Rich text / Markdown string
  mediaUrls: string[];      // Array of uploaded images/media links
  tags: string[];           // Grammar/Vocabulary tags (e.g. ["#PassiveVoice", "#Gerund"])
  createdById: string;      // Ref to Admin/Teacher
  updatedAt: Date;
  status: ExplanationStatus;
}
```

### 1.3 `UserNote`
Stores student notes for a question.
```typescript
enum UserNoteCategory {
  GRAMMAR = 'GRAMMAR',
  VOCABULARY = 'VOCABULARY',
  STRATEGY = 'STRATEGY',
  REMINDER = 'REMINDER',
}

interface UserNote {
  id: string;
  userId: string;
  questionId: string;
  testId: string;
  content: string;
  category: UserNoteCategory;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 2. API Endpoints Specifications

### 2.1 Test Attempts
*   `POST /api/toeic/attempts/start` - Initialize a test session.
    *   *Body*: `{ testId: string, mode: TestAttemptMode, partsAttempted: number[], customTimeLimit?: number }`
*   `POST /api/toeic/attempts/:id/submit` - End test session and calculate results.
    *   *Body*: `{ answers: { questionId: string, selectedOption: string, timeSpent: number }[] }`
*   `GET /api/toeic/attempts/:id` - Retrieve results and details for an attempt.
*   `GET /api/toeic/attempts` - List history of attempts for the current user.

### 2.2 Explanations
*   `GET /api/toeic/questions/:questionId/explanation` - Retrieve explanation details for a question.
*   `POST /api/toeic/questions/:questionId/explanation` (Admin only) - Create or edit explanations.
*   `GET /api/admin/explanations/reports` (Admin only) - Fetch student reports on explanations.

### 2.3 User Notes
*   `POST /api/notes` - Create or update a note.
    *   *Body*: `{ questionId: string, testId: string, content: string, category: UserNoteCategory, tags: string[] }`
*   `GET /api/notes` - Retrieve all notes for the authenticated user (with filters).
*   `DELETE /api/notes/:id` - Delete a note.
