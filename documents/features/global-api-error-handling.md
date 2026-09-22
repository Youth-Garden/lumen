# Feature Plan: Global API Error Handling

> **Status**: Completed
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2025-09-22
> **Target Module**: backend/src/shared/presentation/filters | frontend/apps/web/src/services/core

---

## 1. Overview & Objectives

Standardize error handling across the full stack:

- **Backend**: Unhandled exceptions (500) must return a generic, user-safe message (`"Internal server error"`). Technical details are logged server-side only — never leaked to the client.
- **Frontend**: All API errors are automatically shown to the user via toast notifications through a centralized `onError` callback in `CoreService`, eliminating the need for per-component error handling boilerplate.

---

## 2. Requirements & Scope

### Functional Requirements
- [x] Backend `ExceptionsFilter` returns `CommonEx.InternalError.message` for unhandled exceptions instead of raw `exception.message`.
- [x] Backend logs the full exception stack trace server-side via `Logger.error()`.
- [x] Frontend `CoreService` wires `onError` callback to display first error message via `toast.error()`.
- [x] Frontend `CoreService` wires `onNetworkError` callback for connection failures.
- [x] Toast deduplication via `id` parameter to prevent spam on rapid errors.

### Non-Functional Requirements
- No internal infrastructure details (Redis URLs, rate limit numbers, stack traces) exposed to the client.
- Generic 500 message is defined once in `CommonEx.InternalError.message` — single source of truth.

### Out of Scope
- Custom error pages (404, 403) — handled separately.
- Per-endpoint error customization — callers can still use `disabledToast: true` and handle errors locally.

---

## 3. Architecture & Technical Contracts

### Backend (Exception Filter)

The `ExceptionsFilter` handles three tiers of exceptions:

1. **Domain Exceptions (`AppException`)**: Returns domain-specific `code` + `message` + `errors[]`. These are intentional, user-facing errors (e.g. "Invalid credentials", "Folder not found").
2. **NestJS HTTP Exceptions (`HttpException`)**: Returns HTTP status code with framework message. Includes validation pipe errors mapped to `ErrorItem[]`.
3. **Unhandled System Exceptions**: Returns generic `INTERNAL_ERROR` with `"Internal server error"` message. The raw exception is logged server-side only.

### Frontend (CoreService)

`CoreService` constructor passes `onError` and `onNetworkError` callbacks to `BaseApiService`:

- `onError(errors, message)`: Fires `toast.error(errors[0])` with dedup `id`.
- `onNetworkError(message)`: Fires `toast.error(message)` with fixed `id: 'network-error'`.
- Callers can opt out via `{ disabledToast: true }` in request config.

---

## 4. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `backend/src/shared/presentation/filters/exception.filter.ts` | Use `CommonEx.InternalError.message` instead of raw `exception.message` |
| `[MODIFY]` | `frontend/apps/web/src/services/core/core.service.ts` | Wire `onError` / `onNetworkError` callbacks with `toast` |

---

## 5. Implementation & Quality Verification Checklist

- [x] Backend returns generic message for unhandled 500 errors.
- [x] Backend logs full exception details server-side.
- [x] Frontend `tsc --noEmit` passes with 0 errors.
- [x] No `any` type bypasses.
- [x] Toast deduplication prevents spam.
- [x] `disabledToast` opt-out mechanism preserved.

---

## 6. Risks & Technical Considerations

- **Debugging production errors**: Since 500 responses no longer contain technical details, all debugging must rely on server-side logs. Ensure logging infrastructure (stdout/Render logs) is accessible.
- **Domain exceptions are still transparent**: Only unhandled/system exceptions are masked. `AppException` messages (validation errors, auth errors) are still returned as-is since they are intentionally user-facing.
