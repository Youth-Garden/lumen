---
name: backend
description: Architectural rules, guidelines, clean DDD/CQRS patterns, NestJS Fastify adapter standards, DTO validations, type-safety, zero-any policy, and database indexing for Lumen backend.
---

# Backend Development Guidelines — NestJS DDD/CQRS Architecture Rules

This skill defines mandatory rules and architectural patterns for any AI agent or developer contributing backend code to the Lumen repository.

---

## 1. Tech Stack (Mandatory)

| Layer          | Technology                                 | Notes                                                                                                                                       |
| -------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework      | **NestJS**                                 | Use `@nestjs/platform-fastify`, **NOT** `@nestjs/platform-express`                                                                          |
| HTTP Adapter   | **Fastify**                                | Always bootstrap with `FastifyAdapter`. Do not introduce Express-specific middleware or types (`express.Request`, `express.Response`, etc.) |
| ORM            | **TypeORM**                                | Use Repository pattern via TypeORM `Repository<Entity>` / `DataSource`, wrapped behind domain repository interfaces                          |
| Database       | PostgreSQL                                 |                                                                                                                                             |
| Message Broker | Kafka                                      | For cross-module domain event communication                                                                                                 |
| Job Queue      | BullMQ                                     | For async tasks (emails, notifications, etc.)                                                                                               |
| Validation     | `class-validator` + `class-transformer`    | All incoming/outgoing data must be validated via classes, never raw interfaces                                                              |
| Architecture   | DDD + CQRS + Event-Driven + Outbox Pattern |                                                                                                                                             |

### Fastify Bootstrap Reference

```typescript
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
```

---

## 2. Type Safety Rules (STRICT — NO EXCEPTIONS)

### 2.1 `any` is FORBIDDEN

- **Never** use `any` as a type, return type, parameter type, or generic argument.
- **Never** use implicit `any` (make sure `noImplicitAny: true` is set in `tsconfig.json` and never suppress it).
- **Never** use `as any` to bypass a type error. If a cast is truly necessary, cast to the narrowest correct type, or fix the underlying type mismatch instead.
- If a type is genuinely unknown at compile time (e.g. parsing external JSON), use `unknown` and narrow it with type guards — never `any`.

```typescript
// ❌ FORBIDDEN
function parsePayload(raw: any): any {
  return JSON.parse(raw);
}

// ✅ CORRECT
function parsePayload(raw: string): unknown {
  return JSON.parse(raw);
}

function isUserPayload(value: unknown): value is UserPayloadDto {
  return typeof value === 'object' && value !== null && 'email' in value;
}
```

### 2.2 Every Request and Response MUST be a Class, Never a Bare Interface or Inline Type

This applies to **every layer that crosses a boundary**: HTTP controllers, Kafka consumers, BullMQ job payloads, and command/query objects.

- **Request DTOs**: Always a class decorated with `class-validator` decorators.
- **Response DTOs**: Always a class (not an interface, not `Record<string, unknown>`, not an inline object type). Response classes should use `class-transformer`'s `@Expose()` / `@Exclude()` to control serialized shape.

```typescript
// ❌ FORBIDDEN — interface, no validation, no serialization control
export interface ChangeUserStatusRequest {
  userId: string;
  status: string;
  reason: string;
}

// ✅ CORRECT — class with validation
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { UserStatus } from '@/generated/typeorm/enums';

export class ChangeUserStatusDto {
  @IsUUID()
  userId: string;

  @IsEnum(UserStatus)
  status: UserStatus;

  @IsString()
  reason: string;
}

// ✅ CORRECT — response class with explicit serialization control
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Exclude()
  passwordHash: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
```

- Controllers must declare an explicit return type using the response class — never leave the return type inferred as `any` or `Promise<any>`.

### 2.3 Generics Over `any` in Reusable Utilities

If writing a generic repository, mapper, or handler base class, use proper generic type parameters instead of `any`.

---

## 3. Module Structure (Clean Architecture / DDD Layering)

```
src/modules/{module-name}/
├── domain/                    # Business logic layer
│   ├── aggregates/            # Aggregate roots (business entities)
│   ├── value-objects/         # Immutable value objects
│   ├── events/                # Domain events
│   ├── repositories/          # Repository interfaces (ports)
│   ├── exceptions/            # Domain-specific exceptions
│   └── enums/                 # Domain constants
├── application/                # Use cases layer
│   ├── commands/               # CQRS commands
│   ├── queries/                # CQRS queries
│   ├── handlers/               # Command/Query/Event handlers
│   ├── dtos/                   # Request DTOs (class-validator)
│   └── responses/               # Response DTOs (class-transformer)
├── infrastructure/              # Technical implementations
│   ├── entities/                # TypeORM entities
│   ├── repositories/            # Repository implementations
│   ├── adapters/                # External service adapters
│   ├── jobs/                      # Outbox workers, cron jobs
│   └── kafka/                      # Kafka producers/consumers
├── presentation/                  # Interface layer
│   ├── http/                       # REST controllers (Fastify)
│   └── event-consumers/             # Kafka event consumers
└── {module}.module.ts                # Module configuration
```

**Dependency rule:** dependencies point inward only. `presentation` → `application` → `domain`. `infrastructure` implements interfaces defined in `domain`, never the other way around. `domain` must never import from `infrastructure` or `presentation`.

---

## 4. Key Patterns

### 4.1 Aggregate Root

Aggregates encapsulate business logic, maintain invariants, and emit domain events. They must never contain `any` typed properties or methods.

### 4.2 Value Objects

Immutable, self-validating. Constructor throws on invalid input — never return `any` or unchecked primitives.

### 4.3 CQRS

- **Commands (write):** Encapsulated use-cases that alter domain state. Always declare `ICommandHandler<TCommand, TResult>` generics explicitly.
- **Queries (read):** Read operations returning clean response DTO classes.

### 4.4 Outbox Pattern & Event-Driven Architecture

Persist aggregate state and domain events atomically in the same TypeORM transaction; a background worker publishes pending outbox rows to Kafka.

---

## 5. Repository Pattern with TypeORM

- Domain layer defines a repository **interface** (port), e.g. `AuthUserRepository`, with methods returning domain aggregates — never TypeORM entities directly.
- Infrastructure layer implements this interface using TypeORM's `Repository<Entity>` or `DataSource`.
- Controllers, handlers, and domain code must never import a TypeORM entity class directly — only the domain aggregate and repository interface.

---

## 6. Naming Conventions

| Concept        | Convention                           | Example                  |
| -------------- | ------------------------------------ | ------------------------ |
| Command        | `{Action}{Entity}Command`            | `RegisterUserCommand`    |
| Query          | `{Action}{Entity}Query`              | `GetUserByIdQuery`       |
| Event          | `{Entity}{Action}Event` (past tense) | `UserRegisteredEvent`    |
| Handler        | `{CommandOrEventName}Handler`        | `RegisterUserHandler`    |
| Request DTO    | `{Action}{Entity}Dto`                | `ChangeUserStatusDto`    |
| Response DTO   | `{Entity}ResponseDto`                | `UserResponseDto`        |
| Aggregate      | `{EntityName}`                       | `AuthUser`               |
| Value Object   | `{Concept}`                          | `Email`, `HashedPassword`|
| TypeORM Entity | `{EntityName}Entity`                 | `UserEntity`             |
| Repo Interface | `I{EntityName}Repository`            | `IUserRepository`        |
| Repo Impl      | `{EntityName}Repository`             | `UserRepository`         |

---

## 7. Implementation Checklist for New Features

- **Step 1 — Domain Layer**: Create events, aggregates, value objects, exceptions.
- **Step 2 — Application Layer**: Create commands/queries, request/response DTOs, handlers.
- **Step 3 — Presentation Layer**: Create Fastify controllers with explicit response types.
- **Step 4 — Registration**: Register providers in NestJS module.
- **Step 5 — Type Safety Gate**: Run `tsc --noEmit` and `eslint` check with zero `any` violations.

---

## 8. Strict Zero-Workaround & Zero-Anti-Pattern Rule (MANDATORY)

- **ABSOLUTELY NO WORKAROUNDS OR ANTI-PATTERNS**:
  1. **Workarounds & Compatibility Aliases**: NEVER create alias bridges (`export const DECK_REPOSITORY = FOLDER_REPOSITORY;`) or wrapper functions to avoid refactoring.
  2. **Layer Leakage (Breaking DDD Boundaries)**: NEVER allow TypeORM entities to leak into domain aggregates, application DTOs, or controllers.
  3. **Careless `any` and Type Bypasses**: NEVER use `any`, `as any`, or lint suppressions.
  4. **Mixing I/O Boundaries**: NEVER use bare interfaces for DTOs across network boundaries; always use validated classes with `class-validator` and `class-transformer`.

---

## 9. Query Serialization, Parameterized APIs & Indexing Rules (MANDATORY)

- **Parameterized Query APIs**: Query endpoints and handlers MUST accept optional filter/pagination parameters (`folderId`, `limit`, `page`) without forced hardcoded default limits.
- **B-Tree Composite Indexing**: Entities with timestamp/date scheduling fields MUST have B-Tree composite indexes on `(userId, nextReviewAt)` to allow $O(\log N)$ index-only `COUNT(*)` calculations.
- **Summary Metrics in Overview DTOs**: Overview endpoints MUST expose pre-calculated or indexed count fields so clients do not need to fetch entity lists to render badges.

## 10. Strict Zero-Workaround & Zero-Anti-Pattern Rule (MANDATORY)

- **ABSOLUTELY NO WORKAROUNDS OR ANTI-PATTERNS**:
  - Unless explicitly requested by the user in the current prompt, ANY anti-pattern or workaround is STRICTLY FORBIDDEN.
  - Never take shortcuts, apply temporary hacks, or bypass technical constraints through anti-architectural patches.
  - All solutions MUST strictly adhere to Clean Architecture, Single Source of Truth, and Separation of Concerns from the start.
  - Strictly Forbidden Anti-Patterns & Workarounds:
    1. **Service Layer Leaking into UI (Mixing Presentation & Data Layer)**: The HTTP Client / Service layer (`CoreService`, API services) MUST NOT import UI components, MUST NOT trigger `toast`, MUST NOT parse cookies/DOM/URL to guess UI state, and MUST NOT navigate via `window.location`. Services interact solely with HTTP, mappers, and domain state (Zustand store / Events).
    2. **Duplicate Dictionary / Ad-hoc i18n**: NEVER define custom dictionary objects or custom translation functions in services/utils. All display copy MUST be centralized in `messages/{locale}.json` and rendered via `useTranslations` from `next-intl` in the UI layer.
    3. **Workarounds & Compatibility Aliases**: NEVER create alias bridges (`export const useCreateDeck = useCreateFolder;`, `export type Deck = Folder;`) to avoid refactoring. Refactor thoroughly across the entire codebase.
    4. **Coupled / Ping-Pong State Hooks**: NEVER split a single state flow into mutually interdependent hooks (hook A calls hook B, and hook B sends callbacks back to hook A). Centralize state in a Single Source of Truth and use Pure Functions.
    5. **Careless Type Bypasses**: NEVER use `any`, `as any`, or `as unknown as T` to bypass the TypeScript compiler.

## 11. Strict Prohibition on Opening Browser for Testing (MANDATORY)

- **ABSOLUTELY NEVER OPEN A BROWSER** (do not use `browser_subagent`, Puppeteer, or any browser automation) to test UI or features. Pages and features require user authentication that the agent cannot perform.
- All correctness verifications must be performed via code inspection, logic analysis, running `tsc --noEmit`, running `eslint`, or terminal tests.

## 12. Strict Constants, Enums & Type Certainty Rule (MANDATORY)

- **No Hardcode & Magic Values**: NEVER hardcode magic strings, numbers, or shortcuts. All shortcuts, configs, and ratings MUST be defined via explicit Enums/Constants (e.g. `StudyShortcutKey { FLIP_SPACE = 'Space', MASTERED = '1', ... }`).
- **No Careless `?` and `| null` Abuse**: Ensure exact data schemas. Never add `?` or `| null` carelessly when a field is guaranteed (e.g. if mappers always return empty arrays `[]`, the type is `T[]`). Only use `?` when genuinely optional and `| null` when backend intentionally sends `null`. Never write `?: string | null`.

## 13. Service & API Domain Separation Rule (MANDATORY)

- Service modules in `services/` MUST be strictly separated along business domain boundaries. Never merge multiple domains into a single service.
- For example: Domain `vocabulary` (words, folders, flashcard CRUD) and domain `study` (`dueFlashcards`, `reviewFlashcard`, study sessions) MUST remain two separate services (`services/vocabulary` and `services/study`), with corresponding hooks separated in their respective features (`features/vocabulary/hooks` and `features/study/hooks`).
- **Clean Service Import Convention (MANDATORY)**:
  - When importing types, models, keys, or functions from a domain service, MUST import directly from the root module of that domain (e.g. `import { VocabularyWord } from '@/services/vocabulary';`, `import { User } from '@/services/auth';`, `import { DueFlashcard } from '@/services/study';`).
  - NEVER import deep internal files like `@/services/vocabulary/vocabulary.types`, `@/services/study/study.types`, `@/services/auth/auth.types`, or `@/services/progress/progress.types`.
  - Every service module MUST re-export all types, keys, and services via its root `index.ts`.

## 14. Feature Planning & Business Analysis (From .agents/AGENTS.md)

- **Source of Truth**: Every new feature or major technical enhancement MUST have a dedicated feature document saved in `documents/features/[feature-name].md`.
- **Pre-Implementation Requirement**: Before writing or modifying source code for a non-trivial feature, create or update the corresponding feature plan.
- **Living Document**: Update the status and checklist in `documents/features/[feature-name].md` as work progresses until completion.
- **Feature Plan Template**: Every file in `documents/features/[feature-name].md` MUST strictly follow the standardized markdown template with sections: Overview & Objectives, Requirements & Scope (Functional & Non-Functional), Out of Scope, Architecture & Technical Contracts, File Change Matrix, Implementation & Quality Verification Checklist, Risks & Technical Considerations, and Workflow & Usage Instructions.
- **File Change Matrix**: Track all file changes using the matrix format: Action, File Path, Purpose.
- **Implementation & Quality Verification Checklist**: Must run type checks (`tsc --noEmit`) and build scripts in both `backend` and `frontend`, verify no `any` type bypasses, no manual re-styling of `<Button>` components, all custom React hooks <= 300 lines, clean domain separation, and no hardcoded UI text strings.
- **Risks & Technical Considerations**: Highlight potential edge cases, breaking changes, or risks.
- **Workflow & Usage Instructions**: Follow the standardized workflow: creating a plan, executing step-by-step, and verifying/completing with all checklist items marked.
- **Service Layer Leaking into UI**: Service layer must never import UI components, fire `toast`, parse cookies/DOM, or navigate via `window.location`.
- **Duplicate Dictionaries / Ad-hoc i18n**: All text in `messages/{locale}.json`.
- **Workarounds & Compatibility Aliases**: No bridge aliases (`export const useCreateDeck = useCreateFolder;`).
- **Coupled / Ping-Pong State Hooks**: No circular state coupling between hooks.
- **Careless Type Bypasses**: No `any` or `as unknown as T` in components.
- **No Hardcoded Specialized Content**: Keep platform features generic and neutral. Specialized domain terms (TOEIC, IELTS) belong ONLY inside dedicated modules.
- **No Browser Automation for Testing**: NEVER open a browser (`browser_subagent`, Puppeteer).

## 15. Shared DTO & CQRS Query Inheritance, SOLID & Generic Code Reuse (MANDATORY)

- **Shared DTO Inheritance**: All request/query endpoints with pagination (`page`, `limit`) MUST inherit `PaginationDto` (or `BaseFilterDto` if supporting `search`, `sortBy`, `sortOrder`) from `shared/presentation/dtos/pagination.dto.ts`. NEVER declare loose query params `@Query('page')` or duplicate pagination fields in custom DTOs.
- **Shared CQRS Query Inheritance**: All CQRS Query classes handling pagination criteria MUST inherit `PaginatedQuery` (or `BaseFilterQuery` if handling search/sort) from `shared/application/cqrs/paginated.query.ts` or `shared/application/cqrs/base-filter.query.ts`. Never redeclare `page` and `limit` manually without inheriting from base query classes.
- **Single Source of Truth for Default Values (No Defaults in Repositories/Services)**:
  - Base DTOs (`PaginationDto`) and Base Queries (`PaginatedQuery`) are the ONLY single source of truth for request defaults (`page = 1, limit = 20`).
  - Subclass DTOs and Queries MUST NOT override base default values (e.g. no `limit = 50` or `limit = 10` in subclasses). Frontend is responsible for explicitly passing desired limits (`?limit=50`).
  - Repositories and Domain Services MUST NOT declare default value initializers (`page = 1, limit = 20`) or fallback operators (`|| 1, || 20`) in method signatures. They receive exact typed arguments passed from handlers.
- **Prioritize Generic & DRY Code Reuse**: Standard structures, utilities, DTOs, and wrappers built in `shared/` (such as `PaginationDto`, `BaseFilterDto`, `PaginatedResponseDto`, `PaginatedQuery`, `BaseFilterQuery`, base entities, decorators, mappers) MUST be reused directly. NEVER duplicate existing logic/schemas.
- **Adhere to SOLID Principles**: Ensure Single Responsibility for each handler/DTO, Open/Closed through inheritance from base DTOs/classes, and Interface Segregation across independent query/command ports.
