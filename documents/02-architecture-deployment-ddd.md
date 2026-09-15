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

| Bounded Context             | Responsibility                                          | Ubiquitous Language (key terms)               |
| --------------------------- | ------------------------------------------------------- | --------------------------------------------- |
| **IAM** (Identity & Access) | Registration, login, authorization, subscription tiers  | User, Role, Session, Plan                     |
| **Vocabulary**              | Vocabulary, flashcards, spaced repetition               | Word, WordSet, ReviewSchedule, Deck           |
| **Grammar**                 | Grammar lessons, exercises                              | Lesson, Exercise, Rule                        |
| **ExamPractice**            | Mock tests, multiple-choice grading, band scores        | MockTest, Question, Attempt, Score            |
| **ListeningSpeaking**       | Audio lessons, speaking practice, pronunciation grading | AudioLesson, SpeakingTask, PronunciationScore |
| **Progress**                | Overall progress tracking, dashboards, path suggestions | LearningPath, Milestone, StreakRecord         |
| **Billing**                 | Payments, subscription plans, invoices                  | Subscription, Invoice, Payment                |

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
│   │   │   └── dto/
│   │   │       └── word.dto.ts
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   │   ├── word.orm-entity.ts       # TypeORM/Prisma entity (different from domain entity)
│   │   │   │   └── word.repository.ts       # implements interface from domain/
│   │   │   ├── external/
│   │   │   │   └── dictionary-api.adapter.ts # calls Free Dictionary API/WordsAPI
│   │   │   └── event-handlers/
│   │   │       └── word-mastered.listener.ts
│   │   │
│   │   ├── presentation/
│   │   │   ├── vocabulary.controller.ts
│   │   │   └── vocabulary.module.ts
│   │   │
│   │   └── vocabulary.module.ts   # Nest Module wrapping everything together
│   │
│   ├── grammar/            # similar structure to vocabulary/
│   ├── exam-practice/      # similar structure
│   ├── listening-speaking/ # similar structure, includes client calling AI Worker via queue
│   ├── progress/           # similar structure
│   ├── billing/            # similar structure
│   └── iam/                # similar structure
│
├── shared-kernel/           # Shared code BETWEEN contexts (keep to a minimum)
│   ├── domain/
│   │   └── base-entity.ts
│   ├── decorators/
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── interceptors/
│   └── events/
│       └── domain-event-bus.ts
│
├── config/
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── env.validation.ts
│
├── app.module.ts
└── main.ts
```

### Layer Explanations

- **Domain layer**: Contains pure business logic, NOT dependent on NestJS, databases, or any framework. E.g., the Spaced Repetition algorithm calculating the next review date must be a pure function, testable independently without mocking a database.
- **Application layer**: Coordinates use cases, using the **CQRS** (Command Query Responsibility Segregation) pattern — clearly separating the write flow (Command) and read flow (Query). NestJS provides native support via the `@nestjs/cqrs` package.
- **Infrastructure layer**: Technical details — ORM, external API calls, caching. This is the only place allowed to "know" about TypeORM/Prisma, Redis, HTTP clients.
- **Presentation layer**: Controllers, DTOs for request/response validation, Nest Module wiring.

## 4. Detailed Sample Domain Model — "Vocabulary" Context

To illustrate how to apply DDD in practice, here is a complete example for the Vocabulary module:

### Value Object: `CefrLevel`

```typescript
// domain/value-objects/cefr-level.vo.ts
export class CefrLevel {
  private static readonly VALID_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  private constructor(private readonly value: string) {}

  static create(value: string): CefrLevel {
    if (!this.VALID_LEVELS.includes(value)) {
      throw new InvalidCefrLevelError(value);
    }
    return new CefrLevel(value);
  }

  toString(): string {
    return this.value;
  }

  isHigherThan(other: CefrLevel): boolean {
    return (
      this.VALID_LEVELS.indexOf(this.value) >
      this.VALID_LEVELS.indexOf(other.value)
    );
  }
}
```

### Entity: `Word` (Aggregate Root)

```typescript
// domain/entities/word.entity.ts
export class Word {
  private constructor(
    private readonly id: WordId,
    private readonly text: string,
    private readonly cefrLevel: CefrLevel,
    private readonly definitions: Definition[],
    private masteryStatus: MasteryStatus,
  ) {}

  static create(props: CreateWordProps): Word {
    /* ... factory + validate invariants */
  }

  markAsReviewed(quality: ReviewQuality): DomainEvent[] {
    // Apply SM-2 (SuperMemo) algorithm internally here
    // this.masteryStatus = this.masteryStatus.advance(quality);
    if (this.masteryStatus.isMastered()) {
      return [new WordMasteredEvent(this.id)];
    }
    return [];
  }
}
```

### Application layer — Command Handler (CQRS)

```typescript
// application/commands/review-flashcard.handler.ts
@CommandHandler(ReviewFlashcardCommand)
export class ReviewFlashcardHandler implements ICommandHandler<ReviewFlashcardCommand> {
  constructor(
    @Inject('WordRepository')
    private readonly wordRepo: WordRepositoryInterface,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ReviewFlashcardCommand): Promise<void> {
    const word = await this.wordRepo.findById(command.wordId);
    const events = word.markAsReviewed(command.quality);
    await this.wordRepo.save(word);
    events.forEach((e) => this.eventBus.publish(e));
  }
}
```

**Key takeaway:** The Controller only calls `CommandBus.execute()` / `QueryBus.execute()` and contains no business logic. All logic resides in the Domain + Application layers, making it easy to test and facilitating framework replacement later if needed.

## 5. Asynchronous Communication — Domain Events between Contexts

Example flow: A user completes a mock test (ExamPractice context) → the Progress dashboard needs updating.

```text
ExamPractice Context                          Progress Context
─────────────────────                          ─────────────────
ExamAttempt.complete()
   └─> emits ExamAttemptCompletedEvent
              │
              ▼
     EventBus (internal, in-process)
              │
              ▼
                                    ProgressUpdateListener listens to event
                                    └─> updates LearningPath, Milestone
```

- Use `@nestjs/cqrs` EventBus for **internal in-process communication** (sufficient for a monolith scale).
- When higher reliability is needed (no event loss if the service crashes), consider the **Outbox Pattern**: save the event to an `outbox_events` table in the same transaction as the main write, then a background job reads and publishes it — preventing data loss if errors occur midway.

## 6. Heavy AI Task Processing — Separate Worker via Queue

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

- **Why separate the worker:** Calling Speech-to-Text + LLM has a latency of a few seconds to tens of seconds — HTTP requests cannot be blocked. Separating the worker allows independent scaling (adding worker instances) when the number of users practicing Speaking increases, without affecting the main API.
- **Notifying FE of results:** Use WebSockets (NestJS Gateway) or periodic polling on the result endpoint.

## 7. Data Layer — Database Strategy

- **1 single PostgreSQL instance initially**, but organized by **separate schemas for each Bounded Context** (e.g., `vocabulary.words`, `exam_practice.mock_tests`) — helps maintain clear boundaries, making it easier to separate into different databases later if scaling is needed.
- **Do not share 1 User table for multiple different purposes** — contexts that need user info should only store a referencing `userId` and not JOIN directly across schemas in business code (avoiding coupling).
- Suggested ORM: **Prisma** (easy to use, type-safe, good schema migrations) or **TypeORM** (native integration with NestJS, supports the Repository pattern more clearly for DDD).

## 8. Specific Technologies — Summary

| Component           | Technology                         | Notes                                                          |
| ------------------- | ---------------------------------- | -------------------------------------------------------------- |
| Backend framework   | NestJS                             | Modular Monolith, CQRS module                                  |
| Frontend            | Next.js (App Router)               | SSR for lesson pages (SEO), CSR for interactive practice parts |
| Database            | PostgreSQL                         | Schema-per-context                                             |
| ORM                 | Prisma or TypeORM                  | Depending on team familiarity                                  |
| Cache/Session       | Redis                              | Session, rate-limit, cache flashcard due list                  |
| Queue               | BullMQ (on Redis)                  | AI grading jobs, email sending, heavy tasks                    |
| AI Worker           | Separate Node.js or Python service | Calls LLM API, Speech-to-Text API                              |
| Object Storage      | S3 or Cloudflare R2                | Stores recorded audio files, illustrations                     |
| Auth                | Passport.js + JWT (NestJS)         | Access token + refresh token                                   |
| API docs            | Swagger (`@nestjs/swagger`)        | Auto-generated from decorators                                 |
| Realtime (optional) | Socket.IO (NestJS Gateway)         | AI grading result notifications                                |

## 9. Deployment Strategy

### MVP Phase

```text
┌─────────────────────────────────────────────┐
│              Cloud Provider (e.g., AWS/GCP)   │
│                                                │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐ │
│  │  Next.js   │  │  NestJS   │  │AI Worker  │ │
│  │ (Vercel    │  │ Monolith  │  │ (1 instance│ │
│  │  or        │  │ (Docker,  │  │ 1-2       │ │
│  │  container)│  │ instances)│  │ or        │ │
│  │            │  │           │  │serverless)│ │
│  └───────────┘  └─────┬─────┘  └─────┬─────┘ │
│                       │              │        │
│              ┌────────▼──────┐ ┌─────▼─────┐  │
│              │  PostgreSQL    │ │   Redis   │  │
│              │  (managed,     │ │ (managed) │  │
│              │  RDS/Supabase) │ │           │  │
│              └────────────────┘ └───────────┘  │
└─────────────────────────────────────────────┘
```

- **Frontend**: deploy Next.js on Vercel (simple, optimized SSR/CDN out of the box) or a separate container if infrastructure synchronization is desired.
- **Backend**: Dockerize NestJS, run on 1-2 instances (e.g., ECS Fargate, Cloud Run, or Railway/Render for low-cost initial phase).
- **Database**: use managed PostgreSQL (RDS, Supabase, Neon) to avoid operating backups/failovers manually.
- **CI/CD**: GitHub Actions — automated build, test, deploy when merging to `main`.

### When scaling up (higher traffic)

- Separate AI Worker into an independent service that can auto-scale based on queue length.
- Add a load balancer in front of NestJS, scale horizontally across multiple instances (since it is already stateless thanks to sessions stored in Redis).
- Consider separating the `exam-practice` or `vocabulary` schema into a distinct database if one becomes a noticeable bottleneck — by this time, the Bounded Context boundaries are already prepared for separation with minimal risk.

## 10. Testing Strategy by Layer

| Layer          | Test Type                                        | Tool                             |
| -------------- | ------------------------------------------------ | -------------------------------- |
| Domain         | Pure unit tests (no DB mock)                     | Jest                             |
| Application    | Unit tests with mock Repository interfaces       | Jest                             |
| Infrastructure | Integration tests with real DB (test containers) | Jest + Testcontainers            |
| Presentation   | E2E tests via HTTP                               | Supertest (built-in with NestJS) |

Because the Domain layer does not depend on a framework, it is the easiest part to achieve high coverage for and requires the least amount of change when refactoring infrastructure.

---

_Related Documents: see `01-product-idea.md` for product context and overall Lumen roadmap._
