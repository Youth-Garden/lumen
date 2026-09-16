# Lumen Design System Specification

> **Source of Truth**: This document defines the visual design system, token usage, component conventions, and UI principles for the **Lumen** platform (`@lumen/uikit` and Next.js Frontend).

---

## 1. Visual Design Principles & Aesthetics

1. **Rich & Premium Aesthetic**: Modern, clean, and airy design with curated HSL color tokens, dark mode support, and smooth transitions (150ms–300ms).
2. **Anti-Border & Anti-Card-Clutter (Box-in-Box Prevention)**:
   - **Minimize Hard Borders**: Avoid heavy, rigid borders (`border`, `border-border/80`). Use flat surfaces, subtle background contrasts, and clean margins.
   - **No Box-in-Box Nesting**: Never wrap individual list items, paragraph rows, or options inside nested background boxes (`bg-muted/20`, `bg-muted/30`, `rounded-2xl border...`). Use the page/dialog surface directly with natural padding and typography hierarchy.
3. **Button Variant System (Strict No Manual Re-styling)**:
   - **Zero Custom Button Overrides**: Never manually override `border`, `bg`, `rounded`, `shadow`, or padding classes on the `<Button>` component.
   - **Variant & Size Props Only**: Access all button styles exclusively via props:
     - `variant`: `'default'` | `'secondary'` | `'outline'` | `'ghost'` | `'subtle'` | `'destructive'`
     - `size`: `'default'` | `'sm'` | `'lg'` | `'icon'` | `'icon-sm'`
4. **Minimalist Headers**: Never append redundant count badges or pill numbers (e.g. `(0)`, `[count]`, or `<span ...>{length}</span>`) next to section titles or category headers unless explicitly requested.

---

## 2. Color System & Design Tokens

Lumen uses TailwindCSS combined with CSS variable design tokens supporting light and dark themes.

| Role | Variable | Description |
| :--- | :--- | :--- |
| **Background** | `--background` | Page and screen background surface |
| **Foreground** | `--foreground` | Main text color |
| **Card / Surface** | `--card` | Surface background for main bento cards and dialogs |
| **Primary** | `--primary` | Main action color, brand accent |
| **Primary Foreground** | `--primary-foreground` | Text color on top of primary background |
| **Secondary** | `--secondary` | Subdued action background |
| **Muted** | `--muted` / `--muted-foreground` | De-emphasized backgrounds and secondary text |
| **Border** | `--border` | Subtle divider color |
| **Destructive** | `--destructive` | Error states and destructive actions |
| **Ring** | `--ring` | Focus ring color |

---

## 3. Component Conventions (`@lumen/uikit`)

### 3.1. Base UI Triggers (`render` Prop Mandatory)

All trigger components built on `@base-ui` (`TooltipTrigger`, `PopoverTrigger`, `MenuTrigger`, etc.) **MUST** use the `render` prop instead of `asChild`.

```tsx
// ✅ Correct
<TooltipTrigger render={<button className="..." />} />

// ❌ Incorrect (Do NOT use asChild on Base UI triggers)
<TooltipTrigger asChild><button ... /></TooltipTrigger>
```

### 3.2. Portal & Z-Index Layering Standard

Portal overlays and modals managed by `@lumen/uikit/portal` use minimal, predictable, single-digit/double-digit z-index values:

| Layer | Z-Index Value | Description |
| :--- | :---: | :--- |
| **Background Portals** | `98` | Inactive, lower-stacked open portal dialogs |
| **Shared Backdrop** | `99` | Single overlay backdrop behind active portal |
| **Active Top Portal** | `100` | Currently active top-most portal overlay |

*Note: Avoid bloated z-index numbers like `1000`, `9999`, or complex offset formulas.*

### 3.3. Iconography

- All icons are rendered via the centralized `<Icons name="..." />` component from `@lumen/uikit/icons`.
- **No Emojis as UI Icons**: Emojis are forbidden for functional UI icons. Always use SVG icon components.

---

## 4. Copywriting & Content Neutrality

1. **Generic Platform Copy**: Feature names, folder titles, vocabulary badges, and placeholders must remain neutral and versatile (e.g. use *"System Folders"*, not *"TOEIC System Folders"*).
2. **Dedicated Modules Only**: Specialized exam terminology (TOEIC, IELTS, etc.) is reserved strictly for dedicated exam modules (e.g. mock test simulators).

---

## 5. UI Checklist & Quality Assurance

- [ ] All `<Button>` components use `variant` and `size` props without manual style overrides.
- [ ] No "box-in-box" card clutter or unnecessary inner borders.
- [ ] Base UI triggers use `render={<Element />}`.
- [ ] Overlays strictly follow `98` / `99` / `100` z-index scale.
- [ ] No hardcoded text strings (all text localized via `next-intl`).
- [ ] Interactive elements have `cursor-pointer` and smooth transitions.
