# Feature Plan: Auth Layout Refinement & KeyPress Exception Fix

> **Status**: Completed  
> **Author**: Antigravity Pair Programmer / BA  
> **Date**: 2026-09-26  
> **Target Module**: `frontend/apps/web/src/features/auth` & `frontend/packages/hooks`

---

## 1. Overview & Objectives

This plan addresses two critical feedback items in the Lumen frontend application:
1. **Auth Page Background & Form Clearance Refinement**: The organic wavy SVG backdrop on the brand hero section (`AuthLayout`) currently uses aggressive high-frequency wave oscillations (`Q0.97 / Q0.73`) that encroach on the right column form area, overlapping or crowding form input fields (e.g., Email field) on certain viewport resolutions. The design will be updated to a sleek, organic smooth curve (using cubic Beziers or optimized SVG paths) that gently flows away from the right form section, establishing generous breathing room, clean typography alignment, and a high-end, wow-factor visual aesthetic.
2. **Keyboard Listener Runtime Exception Fix (`useKeyPress`)**: An uncaught `TypeError: Cannot read properties of undefined (reading 'toLowerCase')` occurs when keyboard events trigger without a valid `event.key` string (e.g., composition events, browser autofills, or virtual key presses). Safe nullish handling will be introduced in `packages/hooks/src/use-key-press.ts`.

---

## 2. Requirements & Scope

### Functional Requirements
- [x] Refactor `matchesKey` in `@lumen/hooks/use-key-press.ts` to safely evaluate `event.key` and `event.code` with nullish fallbacks to prevent runtime crashes during form interactions or key combinations.
- [x] Redesign the SVG clipPath in `AuthLayout` (`apps/web/src/features/auth/components/layout.tsx`) into a smooth, elegant, professional Bezier curve that naturally arcs away from form input controls and text labels.
- [x] Adjust container column widths and layout padding (`px-8 lg:px-16 xl:px-24`) to ensure a responsive, un-cluttered 2-column layout across all desktop resolutions (`1024px` to `4K`).

### Non-Functional Requirements
- **Performance**: Zero runtime overhead; SVG `clipPath` and CSS grid/flex layout hardware-accelerated.
- **Type Safety**: Strictly zero `any`, strict nullish checks on `KeyboardEvent` properties.
- **UI/UX Compliance**: Adheres to Lumen design language (airy, subtle glassmorphism, no hard border clutter, premium typography hierarchy).

### Out of Scope
- Backend API authentication changes.
- Modifying individual auth sub-pages (Login, Register, Reset Password) beyond their shared wrapper layout.

---

## 3. UI/UX Specifications (Frontend)

- **Layout Grid**: 
  - Left hero panel: `lg:w-[52%] xl:w-[55%]` with absolute positioning for background WebGL Silk & vignette overlay.
  - Right form panel: `w-full lg:w-[48%] xl:w-[45%]` with explicit horizontal padding (`px-6 sm:px-12 lg:px-16 xl:px-24`) to guarantee form fields remain completely isolated from background curves.
- **SVG Wave Boundary Geometry**:
  - Replaced tight 5-hump sine waves with a gentle 2-curve cubic Bezier transition that stays within `0.78` to `0.88` bounds of the hero container width.
  - Crests and troughs are engineered to bow inward where form inputs sit on the right side, ensuring text labels and inputs have a wide visual margin.
- **Visual Enhancements**:
  - Soft ambient glow transition along the hero-to-form boundary.
  - Maintained WebGL `Silk` background texture and subtle radial dot grid for tactile depth.
- **Accessibility & i18n**:
  - SVG element marked `aria-hidden="true"`.
  - All copy maintained via `Auth.Layout` translation catalog in `messages/{locale}.json`.

---

## 4. Architecture & Technical Contracts

### Frontend (Next.js App Router & UIKit Packages)

#### 1. Safe Keyboard Event Handler (`packages/hooks/src/use-key-press.ts`)
```ts
function matchesKey(event: KeyboardEvent, keyFilter: KeyFilter): boolean {
  if (typeof keyFilter === 'function') {
    return keyFilter(event);
  }

  // Safe property extraction preventing undefined.toLowerCase() exceptions
  const pressedKey = (event?.key || '').toLowerCase();
  const pressedCode = (event?.code || '').toLowerCase();

  if (!pressedKey && !pressedCode) return false;

  if (Array.isArray(keyFilter)) {
    return keyFilter.some(
      (k) => k.toLowerCase() === pressedKey || k.toLowerCase() === pressedCode,
    );
  }

  const targetKey = keyFilter.toLowerCase();
  return targetKey === pressedKey || targetKey === pressedCode;
}
```

#### 2. Refactored Auth Layout (`apps/web/src/features/auth/components/layout.tsx`)
- Optimized SVG `clipPath` with normalized `clipPathUnits="objectBoundingBox"`.
- Clean separation between background clipping wrapper and left-hand text overlay.

---

## 5. File Change Matrix

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `packages/hooks/src/use-key-press.ts` | Fix `undefined.toLowerCase()` runtime exception in `matchesKey` |
| `[MODIFY]` | `apps/web/src/features/auth/components/layout.tsx` | Redesign SVG wave boundary, balance column proportions, and prevent form text collision |

---

## 6. Implementation & Quality Verification Checklist

- [x] Run `pnpm --filter web exec tsc --noEmit` in `frontend/` to verify zero TypeScript errors.
- [x] Run `pnpm exec tsc --noEmit` in `packages/hooks` / root frontend workspace.
- [x] Run `pnpm --filter web lint` to ensure zero ESLint warnings or errors.
- [x] Inspect `matchesKey` logic to ensure `event.key === undefined` does not throw an error.
- [x] Verify `AuthLayout` responsiveness and form input clearance.

---

## 7. Risks & Technical Considerations

- **Browser-specific Keyboard Event Quirks**: Certain IME composition events or password manager auto-fills dispatch synthetic KeyboardEvent objects where `.key` is empty or `Unidentified`. Safe fallbacks guarantee stability.
- **ClipPath Aspect Ratio**: Using `clipPathUnits="objectBoundingBox"` ensures the wave path scales smoothly with the hero container regardless of screen height/aspect ratio.
