---
name: qc
description: Quality Control (QC) skill for test planning, test case specifications, unit testing standards, test automation, and verification across Lumen backend and frontend.
---

# Quality Control (QC) & Testing Standards Skill — Lumen

This skill defines the mandatory testing standards, test case design conventions, test runner integration, and quality assurance workflows across the Lumen platform.

---

## 1. Core Testing Philosophy & Zero-Flakiness Rules

1. **Deterministic & Isolated**:
   - Tests MUST be completely deterministic. Never rely on current wall-clock time (`Date.now()`, `new Date()`) without mocking or fixing system time (e.g. `vi.setSystemTime` / `jest.useFakeTimers`).
   - Never rely on real network connections, live database instances, or external 3rd-party services (Resend, Cloudinary, AWS S3) in unit tests.
2. **AAA Standard (Arrange - Act - Assert)**:
   - Every test case must be clearly divided into 3 discrete phases:
     - **Arrange**: Set up inputs, state, and mocks.
     - **Act**: Execute the specific function, method, or hook under test.
     - **Assert**: Verify outputs, state transitions, or mock invocations.
3. **Behavior-Driven Naming Convention**:
   - Describe blocks: `describe('[UnitName / Component / Hook / Handler]', () => ...)`
   - Test cases: `it('should [expected behavior] when [specific condition]', () => ...)`
   - Never write vague test names like `it('works')` or `it('test 1')`.
4. **Mock Isolation Rule**:
   - Mock at architectural boundaries (HTTP clients, Database repositories, Event publishers).
   - NEVER mock the internal pure calculation or business logic being tested.
5. **No Workarounds in Tests**:
   - Do NOT use `as any` in test assertions. Use strongly typed mock factories and DTOs.

---

## 2. Test Architecture by Layer

### A. Frontend Testing Standards (Vitest / React Testing Library)

> **Mandatory Subfolder Convention**: Unit test files MUST be placed in a dedicated `__tests__/` subfolder inside their respective directory (e.g. `hooks/__tests__/*.spec.ts`, `utils/__tests__/*.spec.ts`, `aggregates/__tests__/*.spec.ts`). NEVER place `.spec.ts` files directly in the parent directory.

| Layer / Target | File Placement | Test Runner | Testing Strategy |
| :--- | :--- | :--- | :--- |
| **Pure Utilities & Calculators** (`utils/*.ts`) | `utils/__tests__/[name].spec.ts` | Vitest | 100% boundary & edge case coverage (empty arrays, zero values, extreme bounds). |
| **Custom React Hooks** (`hooks/use-[name].ts`) | `hooks/__tests__/use-[name].spec.ts` | Vitest (`@testing-library/react` `renderHook`) | Test state transitions, action dispatches, and unmount cleanup. |
| **Domain Mappers & Serializers** | `utils/__tests__/[name].mapper.spec.ts` | Vitest | Test strict schema conversions between DTOs and UI domain entities. |
| **UIKit Components & Stories** | `packages/uikit/src/stories/*.stories.tsx` | Storybook / Vitest | Visual regression, a11y checks (`@storybook/addon-a11y`), and interaction tests. |

#### Frontend Unit Test Example (`utils/__tests__/study-session.utils.spec.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { calculateNewFlashcardProgress, resolveStudyPool } from '../study-session.utils';
import { FlashcardRating } from '@/services/study';
import { StudySessionMode } from '@/features/study/types/study.types';

describe('study-session.utils', () => {
  describe('calculateNewFlashcardProgress', () => {
    it('should set level 6 and isMastered true when rated FAST_TRACK_KNOWN', () => {
      // Arrange
      const currentLevel = 0;
      const currentStep = 0;

      // Act
      const result = calculateNewFlashcardProgress(
        FlashcardRating.FAST_TRACK_KNOWN,
        currentLevel,
        currentStep,
      );

      // Assert
      expect(result).toEqual({
        newLevel: 6,
        newLearningStep: 6,
        isMastered: true,
      });
    });
  });
});
```

---

### B. Backend Testing Standards (Jest / NestJS Testing)

> **Mandatory Subfolder Convention**: Backend test files MUST be placed in a dedicated `__tests__/` subfolder inside their target layer (e.g. `domain/aggregates/__tests__/*.spec.ts`, `application/commands/__tests__/*.spec.ts`, `application/dtos/__tests__/*.spec.ts`).

| Layer / Target | File Placement | Test Runner | Testing Strategy |
| :--- | :--- | :--- | :--- |
| **Domain Aggregates & Entities** | `domain/aggregates/__tests__/[name].aggregate.spec.ts` | Jest | Pure unit tests on aggregate invariants, business methods, and domain events. |
| **CQRS Command / Query Handlers** | `application/commands/__tests__/[name].handler.spec.ts` | Jest (`@nestjs/testing`) | Mock repository ports, verify business orchestrations and return values. |
| **DTOs & Validators** | `application/dtos/__tests__/[name].dto.spec.ts` | Jest (`class-validator` `validate`) | Test validation decorators (`@IsUUID`, `@Transform`, boundary numbers). |
| **E2E Controller Tests** | `test/[context]/[feature].e2e-spec.ts` | Jest + Supertest (`@nestjs/platform-fastify`) | HTTP status codes, Fastify cookie parsing, and auth guard enforcement. |

#### Backend Command Handler Test Example:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewFlashcardHandler } from './review-flashcard.handler';
import { FLASHCARD_REPOSITORY_PORT } from '../../domain/ports/flashcard.repository.port';

describe('ReviewFlashcardHandler', () => {
  let handler: ReviewFlashcardHandler;
  const mockRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewFlashcardHandler,
        {
          provide: FLASHCARD_REPOSITORY_PORT,
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<ReviewFlashcardHandler>(ReviewFlashcardHandler);
    jest.clearAllMocks();
  });

  it('should update flashcard progress and save when review is valid', async () => {
    // Arrange
    const mockCard = { id: 'card-1', recordReview: jest.fn() };
    mockRepository.findById.mockResolvedValue(mockCard);
    mockRepository.save.mockImplementation((card) => Promise.resolve(card));

    // Act
    await handler.execute({ flashcardId: 'card-1', isCorrect: true, userId: 'user-1' });

    // Assert
    expect(mockRepository.findById).toHaveBeenCalledWith('card-1');
    expect(mockRepository.save).toHaveBeenCalled();
  });
});
```

---

## 3. Test Case Specification & Test Matrix Template

When drafting test cases for a feature, save them in `documents/test-plans/[feature-name].test-plan.md` using this standard:

```markdown
# Test Plan: [Feature Name]

> **Target Module**: [frontend/... | backend/...]
> **Status**: [Draft | In Progress | Verified]
> **Date**: YYYY-MM-DD

## 1. Test Scope & Risk Matrix

| Risk Level | Target Area | Key Scenarios |
| :--- | :--- | :--- |
| **High** | Core calculation / payment / state persistence | Edge values, zero division, concurrency |
| **Medium** | Filtering & Sorting | Multi-parameter filters, null/empty collections |
| **Low** | UI Layout & Static Copy | Typography, color tokens, responsive breakpoints |

## 2. Test Case Matrix

| ID | Category | Test Scenario | Input / Precondition | Expected Output | Automated? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-01` | Unit | Fast-track Known rating | Flashcard with rating 1 | Card sets to Level 6, excluded from session quiz | Yes (`*.spec.ts`) |
| `TC-02` | Unit | Browser back interception | `popstate` triggered in study view | `pushState` cancels jump, Confirm Exit dialog opens | Yes (`use-block-browser-back.spec.ts`) |
| `TC-03` | Edge | 0 unlearned words in topic | Topic with all words learned | Toast info shown, smoothly switches to Practice mode | Yes |
| `TC-04` | E2E | Batch review flashcards | Array of 10 reviewed items | Returns 200 OK, updates nextReviewAt | Yes (`*.e2e-spec.ts`) |

## 3. Automated Test Execution Commands

- **Backend Unit Tests**: `pnpm --filter backend test`
- **Frontend Unit Tests**: `pnpm --filter web test` (or `vitest run`)
- **UIKit Component Tests**: `pnpm --filter @lumen/uikit test`
```

---

## 4. QC Verification Checklist (Pre-Commit / Pre-Push)

Before confirming any task as completed, verify all gates:
- [ ] **Unit Tests Passing**: All tests in `*.spec.ts` pass with 0 failures.
- [ ] **Boundary & Edge Cases Covered**: Tested empty lists `[]`, single items, zero `0`, negative numbers, max quota thresholds.
- [ ] **Deterministic Timers**: No unresolved async timers or memory leaks.
- [ ] **Type & Lint Gates**: `tsc --noEmit` / `pnpm run build` and `pnpm run lint` pass with 0 errors.
- [ ] **Regression Check**: Verified existing features are unaffected by the new modifications.
