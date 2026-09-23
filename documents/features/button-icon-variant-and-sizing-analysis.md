# Feature Plan: Button Icon Variant & Sizing Architecture Analysis

> **Status**: In Review  
> **Author**: Antigravity Pair Programmer / BA  
> **Date**: 2026-09-22  
> **Target Module**: `frontend/packages/uikit/src/components/ui/button.tsx`

---

## 1. Overview & Objectives

Analyze the proposal to merge `size="icon"` into a standalone `variant="icon"` (or adding an icon-specific variant with automatic sizing), evaluating design system best practices (CVA, Base UI, Shadcn, Material, Radix) and the impact on the Lumen component architecture.

---

## 2. Technical Evaluation: `size="icon"` vs `variant="icon"`

### 2.1. Separation of Concerns in Design Systems

In modern component libraries (CVA / Tailwind / Base UI / Radix / Shadcn):
- **`variant` (Visual Surface / Appearance)**: Controls background, borders, text color, shadows, and hover/active states (`default`, `secondary`, `outline`, `ghost`, `destructive`, `text`).
- **`size` (Geometry & Dimensions)**: Controls width, height, padding, gap, aspect ratio, and typography scale (`default`, `xs`, `sm`, `lg`, `icon`).

### 2.2. Architectural Comparison

| Criteria | Option A: `size="icon"` (Current Orthogonal Model) | Option B: `variant="icon"` (Merged Model) |
| :--- | :--- | :--- |
| **Flexibility** | **High**: Any visual variant (`ghost`, `outline`, `secondary`, `default`, `destructive`) can be an icon button. | **Low**: `variant="icon"` only has ONE fixed appearance (e.g. ghost/text). Cannot make an outline icon button or primary icon button without custom className hacks or `icon-outline`, `icon-ghost` variant explosion. |
| **Real-world Use Cases in Lumen** | - Dialog/Sheet Close: `variant="ghost" size="icon"`<br/>- Study Shortcuts Trigger: `variant="outline" size="icon"`<br/>- Audio Play Button: `variant="ghost" size="icon"`<br/>- Goal Setting Trigger: `variant="ghost" size="icon"` | If `icon` is a variant, `variant="outline"` cannot be used with an icon button without overriding styles. |
| **Design System Industry Standard** | Standard in Shadcn UI, Radix Themes, Base UI, Tailwind UI, and Chakra. | Anti-pattern in CVA because it conflates *what it looks like* (variant) with *how big it is* (size). |
| **Compound Variant Alternative** | N/A | If `variant="icon"` is added, it conflicts with other color styles. |

---

## 3. Recommended Architectural Solutions

### Solution 1 (Recommended): Keep Orthogonal `size="icon"` + Optional `<IconButton>` Helper
- Keep `size="icon"` in `buttonVariants` so any variant (`ghost`, `outline`, `secondary`, `default`) can be rendered in a `36x36px rounded-full` shape.
- (Optional) Export a dedicated `<IconButton>` component in `@lumen/uikit/components` that sets `size="icon"` and `variant="ghost"` by default:
  ```tsx
  export function IconButton({ variant = 'ghost', ...props }: ButtonProps) {
    return <Button variant={variant} size="icon" {...props} />;
  }
  ```

### Solution 2: Dedicated `variant="icon"` (If strictly requested)
- If `variant="icon"` is added to `buttonVariants`, it would define `variant: { icon: 'bg-transparent text-muted-foreground hover:bg-muted/80 hover:text-foreground size-9 rounded-full' }`.
- **Limitation**: Cannot combine with `variant="outline"`, `variant="secondary"`, or `variant="default"`.

---

## 4. File Change Matrix (If Option 1 Helper is Adopted)

| Action | File Path | Purpose |
| :--- | :--- | :--- |
| `[MODIFY]` | `frontend/packages/uikit/src/components/ui/button.tsx` | Export `IconButton` helper (defaults to `size="icon"`, `variant="ghost"`) |
| `[MODIFY]` | `frontend/packages/uikit/src/components/index.ts` | Re-export `IconButton` |
| `[MODIFY]` | `documents/design-system.md` | Update button documentation |

---

## 5. Implementation & Quality Verification Checklist

- [ ] Frontend build check: `pnpm --filter web exec tsc --noEmit` passes with 0 errors.
- [ ] UIKit build check: `pnpm --filter @lumen/uikit exec tsc --noEmit` passes with 0 errors.
- [ ] ESLint check: `pnpm --filter web lint` passes with 0 errors.
- [ ] No regression on existing `variant="outline" size="icon"` or `variant="ghost" size="icon"` usages.

---

## 6. Conclusion & Recommendation

We recommend **Solution 1**: Retain `size="icon"` as the dimensional token so all visual variants (`ghost`, `outline`, `secondary`, `default`) remain available for icon buttons, and optionally provide an `<IconButton>` wrapper for developer convenience (`<IconButton />` = `<Button variant="ghost" size="icon" />`).
