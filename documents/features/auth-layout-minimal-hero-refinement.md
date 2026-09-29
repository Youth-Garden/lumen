# Feature Plan: Auth Layout Minimal Hero & Form Width Refinement

> **Status**: Completed
> **Author**: Antigravity Pair Programmer / BA
> **Date**: 2026-09-27
> **Target Module**: `frontend/apps/web/src/features/auth/components/layout.tsx`

---

## 1. Overview & Objectives

Refine the authentication page layout (`AuthLayout`) to achieve an ultra-clean, spacious, and modern UI/UX design:
1. **Minimalist Left Hero Background**: Remove duplicate Logo and Badge overlays from the top of the left panel. Shift the hero title and subtitle to the bottom-left corner (`justify-end`), leaving the upper and middle WebGL Silk animation completely open, serene, and uncluttered.
2. **Balanced Right Form Width**: Fine-tune the right-hand authentication container width and form bounds so it feels comfortably spacious without being overly stretched (`lg:w-[48%] xl:w-[46%]`, with `max-w-[440px]` for form elements).

---

## 2. Requirements & Scope

### Functional Requirements
- Remove top Logo & Badge elements from the left hero panel (preventing brand duplication since the right auth form already features the brand logo).
- Position hero copy (`t('title')` and `t('subtitle')`) cleanly at the bottom-left of the left canvas container (`justify-end pb-10 xl:pb-14 px-8 xl:px-12`).
- Adjust grid width distribution:
  - Left Hero Panel: `hidden lg:flex lg:w-[52%] xl:w-[54%]`
  - Right Form Container: `w-full lg:w-[48%] xl:w-[46%]`
- Constrain form wrapper to `w-full max-w-[440px]` for optimal reading width, input ergonomics, and clean margins.

### Non-Functional Requirements
- **UI/UX Aesthetics**: High-end minimalist design with maximum breathing room for WebGL Silk ambient animations.
- **Responsive Layout**: Full CSS-first responsive utilities (`hidden lg:flex`, `w-full`).
- **Clean Code & Type Safety**: 0 unused imports, clean TypeScript without `any`.

### Out of Scope
- Modifying authentication forms (`login-page.tsx`, verification schemas, OTP handling).
- Modifying Three.js shader logic inside `silk.tsx`.

---

## 3. UI/UX Specifications (Frontend)

- **Left Hero Panel Layout**:
  - Container: `relative select-none flex flex-col justify-end p-8 xl:p-14 rounded-3xl overflow-hidden text-white shadow-2xl bg-[#090d16] my-1 ml-1`
  - Hero Copy Block: Positioned at bottom-left with `relative z-20 space-y-3 max-w-lg pb-4 xl:pb-8`.
  - Background: WebGL Silk background with subtle gradient vignette and radial ambient glow.
- **Right Side Container**:
  - Container: `w-full lg:w-[48%] xl:w-[46%] flex flex-col justify-center items-center px-6 sm:px-12 lg:px-12 xl:px-16 py-8`
  - Form Wrapper: `<OpenEffect className="w-full max-w-[440px]">{children}</OpenEffect>`

---

## 4. Architecture & Technical Contracts

### Frontend (Next.js App Router)
- Component modified: `d:\learn\lumen\frontend\apps\web\src\features\auth\components\layout.tsx`
- i18n copy: Consumes `t('title')` and `t('subtitle')` from `Auth.Layout`.

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `frontend/apps/web/src/features/auth/components/layout.tsx` | Remove top Logo/Badge, position text at bottom-left corner, and fine-tune right form width. |

---

## 6. Implementation & Quality Verification Checklist

- [x] Left hero panel has no top Logo/Badge overlay.
- [x] Title and Subtitle sit elegantly in the bottom-left corner.
- [x] Right-hand form container width is balanced (`lg:w-[48%] xl:w-[46%]`, form `max-w-[440px]`).
- [x] `tsc --noEmit` passes with 0 errors.
- [x] No unused imports in `layout.tsx`.

---

## 7. Risks & Technical Considerations

- Ensure mobile view (`<lg`) renders full width form centered cleanly without left panel.
