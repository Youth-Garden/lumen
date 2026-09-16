# Architecture and Deployment Document — Lumen

### Modular Monolith with DDD (NestJS + Next.js)

## 1. Overall Architecture Principles

- **No microservices in the early stages.** Apply **Modular Monolith**: clearly separate domain boundaries in code (following DDD principles) but deploy as a single service — easier to debug, simpler transactions, and faster development speed.
- **One exception separated from the start:** the module handling heavy AI tasks (Speaking/Writing grading, speech-to-text) runs as a separate **worker** communicating via a queue, as these tasks are compute-intensive, require asynchronous processing, and may need to scale independently.
- When the system truly scales up (multiple teams, high traffic), Bounded Context boundaries will already be clear → microservices can be easily separated without rewriting from scratch.

```text
┌─────────────────────────────────────────────────────────┐
│                      Next.js (FE)                        │
│         App Router · SSR for SEO · React Query           │
└───────────────────────┬───────────────────────────────────┘
                         │ REST/GraphQL (HTTPS)
┌───────────────────────▼───────────────────────────────────┐
│                  NestJS API Gateway Layer                  │
│         Auth Guard · Rate Limit · Validation Pipe           │
└───────────────────────┬───────────────────────────────────┘
                         │
┌───────────────────────▼───────────────────────────────────┐
│              MODULAR MONOLITH (NestJS)                     │
│  ┌──────────┐ ┌───────────┐ ┌──────────────┐ ┌──────────┐  │
│  │   IAM    │ │Vocabulary │ │ExamPractice  │ │ Progress │  │
│  │ Context  │ │ Context   │ │  Context     │ │ Context  │  │
│  └──────────┘ └───────────┘ └──────────────┘ └──────────┘  │
│  ┌──────────┐ ┌───────────┐ ┌──────────────┐               │
│  │ Grammar  │ │ Listening │ │  Billing     │               │
│  │ Context  │ │/Speaking  │ │  Context     │               │
│  └──────────┘ └───────────┘ └──────────────┘               │
└───────┬─────────────────────────────┬───────────────────────┘
        │ PostgreSQL (1 DB, schema    │ BullMQ (Redis)
        │ per schema-per-context)     │ Publish job
        │                             ▼
        │                 ┌───────────────────────────┐
        │                 │   AI Worker Service        │
        │                 │  (Speaking/Writing grading)│
        │                 │  Node.js or Python worker  │
        │                 └──────────┬────────────────┘
        │                            │ external call
        ▼                            ▼
   PostgreSQL                 External AI APIs
   (main data source)         (LLM, Speech-to-Text)
```

## 2. Defining Bounded Contexts (following DDD)

A Bounded Context is a business boundary — each context has its own data model and ubiquitous language, preventing a single "Entity" from being used for multiple different meanings.

| Bounded Context | Responsibility | Ubiquitous Language (key terms) |
| --- | --- | --- |
| **IAM** (Identity & Access) | Registration, login, authorization, subscription tiers | User, Role, Session, Plan |
| **Vocabulary** | Vocabulary, flashcards, spaced repetition | Word, WordSet, ReviewSchedule, Deck, Flashcard |
| **Grammar** | Grammar lessons, exercises | Lesson, Exercise, Rule |
| **ExamPractice** | Mock tests, multiple-choice grading, band scores | MockTest, Question, Attempt, Score |
| **ListeningSpeaking** | Audio lessons, speaking practice, pronunciation grading | AudioLesson, SpeakingTask, PronunciationScore |
| **Progress** | Overall progress tracking, dashboards, path suggestions | LearningPath, Milestone, StreakRecord |
| **Billing** | Payments, subscription plans, invoices | Subscription, Invoice, Payment |

**Communication Principles between Contexts:**

- Within the monolith: communicate via internal **Domain Events** (e.g., `ExamAttemptCompletedEvent` emitted by `ExamPractice`, listened to by `Progress` to update the dashboard) — avoid directly calling other context's services to maintain loose coupling.
- No context is allowed to query another context's database tables directly — communication must happen through the public interface/service of that context.

## 3. NestJS Project Directory Structure (following DDD)

Each Bounded Context is organized into the 4 classic DDD layers: **Domain — Application — Infrastructure — Presentation**.

```text
src/
├── contexts/
│   ├── vocabulary/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── word.entity.ts
│   │   │   │   └── word-set.entity.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── cefr-level.vo.ts
│   │   │   │   └── review-interval.vo.ts
│   │   │   ├── repositories/            # interface (port), NO implementation here
│   │   │   │   └── word.repository.interface.ts
│   │   │   └── events/
│   │   │       └── word-mastered.event.ts
│   │   │
│   │   ├── application/
│   │   │   ├── commands/                # CQRS - Command side (writes)
│   │   │   │   ├── add-word-to-deck.command.ts
│   │   │   │   └── add-word-to-deck.handler.ts
│   │   │   ├── queries/                 # CQRS - Query side (reads)
│   │   │   │   ├── get-due-flashcards.query.ts
│   │   │   │   └── get-due-flashcards.handler.ts
│   │   │   └── dtos/
│   │   │       ├── list-due-flashcards.dto.ts
│   │   │       └── word.dto.ts
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   │   ├── word.orm-entity.ts       # TypeORM entity with indexes
│   │   │   │   └── word.repository.ts       # implements interface from domain/
│   │   │   ├── external/
│   │   │   │   └── dictionary-api.adapter.ts
│   │   │   └── event-handlers/
│   │   │       └── word-mastered.listener.ts
│   │   │
│   │   ├── presentation/
│   │   │   └── http/
│   │   │       └── vocabulary.controller.ts
│   │   │
│   │   └── vocabulary.module.ts   # Nest Module wrapping everything together
```

---

## 4. DTO Validation, Query Parameter Transformation & Database Indexing

### 4.1. Flexible Query DTO Transformations
To support flat query string parameters (`?folderId=...&limit=20`) as well as legacy nested parameters (`?params[folderId]=...`), NestJS DTOs utilize custom `@Transform` decorators:

```typescript
export class ListDueFlashcardsDto {
  @ApiPropertyOptional({ description: 'Filter due flashcards by specific folder ID' })
  @IsOptional()
  @IsString()
  @Transform(({ value, obj }) => value || obj?.['params[folderId]'] || obj?.params?.folderId || undefined)
  folderId?: string;

  @ApiPropertyOptional({ description: 'Maximum number of due flashcards to return' })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const rawVal = value ?? obj?.['params[limit]'] ?? obj?.params?.limit;
    return rawVal !== undefined && rawVal !== null ? Number(rawVal) : undefined;
  })
  @IsInt()
  @Min(1)
  limit?: number;
}
```

### 4.2. Database Indexing Strategy
Heavy querying operations (e.g. counting and fetching due flashcards for spaced repetition) MUST be backed by composite database indexes:

```typescript
// UserProgress Entity Composite Index
@Index('idx_user_progress_due', ['userId', 'nextReviewAt'])
export class UserProgressEntity { ... }
```

---

## 5. Heavy AI Task Processing — Separate Worker via Queue

```text
NestJS Monolith                    Redis (BullMQ)              AI Worker Service
────────────────                   ───────────────              ──────────────────
POST /speaking/submit
   └─> validate, save audio (S3)
   └─> push job "grade-speaking"
                  │
                  ▼
           Queue: speaking-grading
                  │
                                                          ┌──────▼──────────────┐
                                                          │ Worker receives job   │
                                                          │ 1. Speech-to-text     │
                                                          │ 2. Call LLM to grade  │
                                                          │ 3. Save result to DB  │
                                                          │ 4. Emit completion evt│
                                                          └───────────────────────┘
GET /speaking/result/:id  <── FE polling or WebSocket when job is done
```

---

## 6. Data Layer & Persistence Strategy

- **1 single PostgreSQL instance initially**, organized by **separate schemas for each Bounded Context** (`vocabulary.*`, `progress.*`).
- **Referential integrity via `userId`**: Contexts that need user identity store a referencing UUID without hard foreign key JOINs across context boundaries.
- **TypeORM Persistence**: All entity entities define explicit data types, default fallbacks, and composite index annotations.

---

## 7. Deployment Strategy

- **Frontend**: Next.js App Router deployed on Vercel / Container.
- **Backend**: NestJS Monolith running in Docker containers behind a load balancer.
- **Database & Redis**: Managed PostgreSQL and Redis instances.
- **CI/CD**: GitHub Actions pipeline enforcing `nest build` and `next build` validation prior to release.
