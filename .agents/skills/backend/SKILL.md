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

- **TUYỆT ĐỐI CẤM MỌI HÌNH THỨC WORKAROUND HOẶC ANTI-PATTERN**:
  1. **Workarounds & Compatibility Aliases**: Tuyệt đối KHÔNG tạo alias bridge (`export const DECK_REPOSITORY = FOLDER_REPOSITORY;`) hay wrapper functions để né tránh refactor.
  2. **Phá vỡ ranh giới DDD (Layer Leakage)**: Tuyệt đối KHÔNG để TypeORM Entity lọt vào Domain Aggregate, Application DTOs hay Controllers.
  3. **Ép kiểu `any` và Type Bypasses**: Tuyệt đối KHÔNG dùng `any`, `as any` hay lint suppressions.
  4. **Trộn lẫn I/O Boundaries**: Tuyệt đối KHÔNG dùng bare interfaces cho DTOs qua network boundary; bắt buộc dùng classes có `class-validator` và `class-transformer`.

---

## 9. Query Serialization, Parameterized APIs & Indexing Rules (MANDATORY)

- **Parameterized Query APIs**: Query endpoints and handlers MUST accept optional filter/pagination parameters (`folderId`, `limit`, `page`) without forced hardcoded default limits.
- **B-Tree Composite Indexing**: Entities with timestamp/date scheduling fields MUST have B-Tree composite indexes on `(userId, nextReviewAt)` to allow $O(\log N)$ index-only `COUNT(*)` calculations.
- **Summary Metrics in Overview DTOs**: Overview endpoints MUST expose pre-calculated or indexed count fields so clients do not need to fetch entity lists to render badges.

## 10. Strict Zero-Workaround & Zero-Anti-Pattern Rule (MANDATORY)

- **TUYỆT ĐỐI CẤM MỌI HÌNH THỨC WORKAROUND HOẶC ANTI-PATTERN**:
  - Nếu KHÔNG CÓ yêu cầu cụ thể, rõ ràng và trực tiếp từ người dùng trong prompt hiện tại, BẤT KỲ anti-pattern hay workaround nào đều TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP SỬ DỤNG.
  - Tuyệt đối không chọn giải pháp "đi tắt" (shortcut), chắp vá tạm thời (quick fix/hack), hay lách qua các giới hạn kỹ thuật bằng các biện pháp phản kiến trúc.
  - Mọi giải pháp bắt buộc phải tuân thủ chuẩn Clean Architecture, Single Source of Truth, và Separation of Concerns ngay từ đầu.
  - Danh mục các Anti-Patterns & Workarounds BỊ CẤM TRIỆT ĐỂ:
    1. **Tầng Service can thiệp UI (Mixing Presentation & Data Layer)**: Tầng HTTP Client / Service (`CoreService`, API services) tuyệt đối KHÔNG được import UI component, KHÔNG bắn `toast`, KHÔNG parse cookie/DOM/URL để đoán ngữ cảnh UI, KHÔNG điều hướng bằng `window.location`. Tầng Service chỉ tương tác với HTTP, mappers và Domain State (Zustand store / Events).
    2. **Duplicate Dictionary / Ad-hoc i18n**: Tuyệt đối KHÔNG tự viết dictionary object riêng, KHÔNG tự chế hàm dịch trong service/utils. Toàn bộ text hiển thị BẮT BUỘC phải tập trung tại `messages/{locale}.json` và được render qua `useTranslations` của `next-intl` trong UI layer.
    3. **Workarounds & Compatibility Aliases**: Tuyệt đối KHÔNG tạo alias bridge (`export const useCreateDeck = useCreateFolder;`, `export type Deck = Folder;`) để né tránh refactor. Phải refactor 100% triệt để.
    4. **Coupled / Ping-Pong State Hooks**: Tuyệt đối KHÔNG chia cắt cùng một luồng state ra nhiều hooks phụ thuộc chéo lẫn nhau (hook A gọi hook B, hook B lại bắn callback ngược về hook A). Phải gom state vào single source of truth và dùng Pure Functions.
    5. **Ép kiểu vô tội vạ (Type Bypasses)**: Tuyệt đối KHÔNG dùng `any`, `as unknown as T` để qua mặt TypeScript compiler.

## 11. Strict Prohibition on Opening Browser for Testing (Bắt buộc)

- **TUYỆT ĐỐI KHÔNG ĐƯỢC MỞ BROWSER** (không dùng browser_subagent, puppeteer hay bất kỳ browser automation nào) để kiểm tra giao diện hoặc tính năng. Các trang/tính năng yêu cầu đăng nhập của người dùng mà agent không thể đăng nhập được.
- Mọi kiểm tra tính đúng đắn phải thực hiện qua việc đọc hiểu code, phân tích logic, chạy `tsc --noEmit`, chạy `eslint` hoặc test code trực tiếp trong terminal, tuyệt đối không tự mở trình duyệt.

## 12. Strict Constants, Enums & Type Certainty Rule (MANDATORY)

- **Chống Hardcode & Magic Values**: Tuyệt đối KHÔNG hardcode magic strings, numbers hay phím tắt. Tất cả phím tắt (shortcuts), configs, ratings BẮT BUỘC định nghĩa qua Enum/Constant rõ nghĩa (ví dụ `StudyShortcutKey { FLIP_SPACE = 'Space', MASTERED = '1', ... }`).
- **Chống Lạm Dụng `?` và `| null` Vô Tội Vạ**: Phải chắc chắn về data schema. Tuyệt đối không gắn `?` hoặc `| null` bừa bãi khi trường đó đã được đảm bảo chắc chắn (như mappers luôn khởi tạo array rỗng `[]` thì type là `T[]`). Chỉ dùng `?` khi thực sự optional và `| null` khi backend cam kết trả `null` có chủ đích. Tuyệt đối không viết `?: string | null`.

## 13. Service & API Domain Separation Rule (MANDATORY)

- Các module dịch vụ trong `services/` phải phân tách độc lập theo đúng domain nghiệp vụ. Tuyệt đối KHÔNG gộp chung các API/endpoint khác domain vào cùng một service.
- Ví dụ: Domain `vocabulary` (từ vựng, thư mục, flashcard CRUD) và domain `study` (flashcard đến hạn ôn tập `dueFlashcards`, nộp kết quả ôn tập `reviewFlashcard`, session học) BẮT BUỘC phải tách riêng thành hai service riêng biệt (`services/vocabulary` và `services/study`), đồng thời các hooks tương ứng cũng phải nằm tách bạch trong feature tương ứng (`features/vocabulary/hooks` và `features/study/hooks`).
- **Clean Service Import Convention (MANDATORY)**:
  - Khi import types, models, keys, hay functions từ một domain service, BẮT BUỘC phải import trực tiếp từ root module của domain đó (ví dụ: `import { VocabularyWord } from '@/services/vocabulary';`, `import { User } from '@/services/auth';`, `import { DueFlashcard } from '@/services/study';`).
  - TUYỆT ĐỐI KHÔNG import sâu vào các file con nội bộ như `@/services/vocabulary/vocabulary.types`, `@/services/study/study.types`, `@/services/auth/auth.types` hay `@/services/progress/progress.types`.
  - Mọi module service BẮT BUỘC phải re-export toàn bộ types, keys, service qua file `index.ts` của domain đó.

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
