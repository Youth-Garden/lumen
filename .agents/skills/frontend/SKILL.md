---
name: frontend
description: Architectural rules, design system guidelines, Base UI render prop triggers, Z-Index scale, hook limit <= 300 lines, direct query params, and copywriting neutrality for Lumen frontend.
---

# Frontend Development Guidelines — Lumen

This skill defines mandatory rules, architectural standards, and design system conventions for frontend code in the Lumen workspace.

---

## 1. Naming Conventions

### 1.1 File & Component Naming

- **Casing**: File names MUST strictly use `kebab-case.tsx` / `kebab-case.ts`. Component names, exported functions, and interfaces MUST strictly use `PascalCase`.
- **Simplicity in Naming**: Keep component and function names as simple and concise as possible. Avoid redundant or overly generic prefixes such as `Global` (e.g. use `NotFound` instead of `GlobalNotFound`, `Error` instead of `GlobalError`).
- **Pages Naming**: Any file inside a `features/[module]/pages/` directory MUST be suffixed with `-page.tsx` (e.g. `deck-list-page.tsx`), and the exported React component MUST be suffixed with `Page` (e.g. `export const DeckListPage = ...`). The filename and component name must stay in sync.
- **Descriptive Variable Names**: Never use single-letter variables or parameters (e.g. `q`, `m`, `n`). Always use descriptive names (e.g. `question`, `user`, `index`, `item`). This is strictly enforced with no exceptions.

### 1.2 React Hooks Naming & File Structure

- **File Naming**: Do NOT name hook files `mutations.ts` or `queries.ts`. Name hook files descriptively based on what they do (e.g. `use-vocabulary.ts`, `use-auth.ts`, `use-materials.ts`, `use-forgot-password.ts`).
- **Grouping**: Group small, related hooks together in a single file (e.g. `use-materials.ts`). Split large or unrelated hooks into their own dedicated files (e.g. `use-forgot-password.ts`).
- **Hook Function Naming**: Do NOT suffix hook function names with `Query` or `Mutation`. Use clean names such as `useCreateMaterial` or `useMaterials` instead of `useCreateMaterialMutation` or `useMaterialsQuery`.

---

## 2. Project & Directory Structure

### 2.1 Strict Separation of Concerns by Directory (MANDATORY)

- **`components/`**: MUST contain React UI components (`.tsx`) ONLY. Never place non-component files (constants, animation variants, configs, utils, types) inside `components/`. When supporting files are needed, create the appropriate dedicated folder instead (`constants/`, `hooks/`, `types/`, `utils/`).
- **`constants/`**: Holds constants, static configs, and animation variants (e.g. `animations.ts`).
- **`hooks/`**: Holds React custom hooks (`use-[name].ts`).
- **`types/`**: Holds domain types, feature models, and shared interfaces (`[feature].types.ts`).

### 2.2 Re-export Convention via `index.ts`

- **Hooks & Constants**: MUST be re-exported centrally through an `index.ts` file in their own directory (e.g. `features/[module]/hooks/index.ts`, `features/[module]/constants/index.ts`) so other modules can import them cleanly and consistently.
- **Components**: Do NOT re-export components through `index.ts`. Components must be imported directly from their specific file to avoid large barrel files and to preserve tree-shaking and code-splitting.

### 2.3 Type Placement Convention

- **Hook-specific Props/Return types**: Types that exist only to serve a hook's parameters or return value (`Use[Name]Props`, `Use[Name]Return`) should be defined directly inside that hook's file (or in a `use-[name].types.ts` file if it grows too large).
- **Domain / Entity / Shared Types**: Types that represent data, business models, stats, or data structures (e.g. `MissedWordStat`, `StudyFeedbackState`, `StudyQueueItem`) must NEVER live inside `hooks/`. They MUST be placed in the module's `types/` directory (e.g. `features/[module]/types/[module].types.ts`).

### 2.4 Pages Directory & Routing (Strict)

- Module-specific pages MUST live inside `features/[module]/pages/`.
- Routing entry files (`page.tsx`) must be absolutely minimal. They must NOT contain UI layout markup (e.g. `<div className="...">`), component imports (like `Icons`), state management, or React hooks.
- They must ONLY import the fully assembled page component from `features/[module]/pages/` and export it directly (e.g. `export default SettingsPage;`).

---

## 3. Component Rules

### 3.1 Data Handling in Components

- **No Fallbacks or Data Transformation in the UI Layer**: Do NOT add default values or fallbacks (e.g. `|| ""`, `|| []`, `|| Date.now() + Math.random()`), or perform data transformations, inside UI components (including inside `useEffect`). All data mapping, formatting, and fallback logic must live in the mapper/service layer or in custom hooks.
- **No In-Component Data Restructuring**: Do NOT reshape or remap data inside UI components. Pass and consume shared types directly. All transformations belong strictly in mapper files (`[feature].mappers.ts`).
- **Reuse Domain/Service Types Directly**: Strictly avoid defining redundant ad-hoc interfaces or adapter types when an existing DTO/domain type from `@/services` already solves the problem.
- **No `any` in Components**: Strictly avoid `any` types in components when mapping or consuming data.

### 3.2 Component Size & Organization

- **Line Count Limit**: Module-specific components (`features/[module]/components/`) and page files (`features/[module]/pages/`) MUST NOT exceed **300 lines**. If a file grows beyond 300 lines, refactor it by either (1) extracting sub-components into separate files, or (2) extracting complex logic into a custom hook.
- **Sub-folder Organization**: Inside `features/[module]/components/`, related components MUST be grouped into dedicated sub-folders based on feature/domain context. Never dump all module components into a single flat `components/` directory.

### 3.3 Design System & UIKit Usage (Strict Zero-Customization Policy)
- **Strict UIKit Component & Icon Reuse**: ALWAYS use components from `@lumen/uikit/components`. All SVGs and icons must be imported from `@lumen/uikit/icons` (via `Icons` or icons registered in UIKit). Never define raw SVG components inside `features/` or `app/`.
- **Zero-Customization on Shared Components (MANDATORY)**:
  - NEVER arbitrarily tweak or override shared components (`<Button>`, `<Card>`, `<Badge>`, `<Dialog>`, `<Sheet>`, `<Input>`, `<Avatar>`) with ad-hoc classes.
  - **NO Custom `shadow-*`**: Never inject `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, or `shadow-none`.
  - **NO Custom `rounded-*`**: Never inject `rounded-3xl`, `rounded-2xl`, `rounded-full`, `rounded-lg`, or `rounded-none`. Use the component's built-in radius tokens.
  - **NO Custom `border-*` / `bg-*`**: Never inject `border-none`, `bg-card`, `bg-muted/...`. Always use the built-in `variant` prop (`default`, `muted`, `outline`, `subtle`, etc.).
  - **NO Custom Sizing / Padding**: Never inject ad-hoc height (`h-9`), width (`w-...`), or padding (`p-...`, `px-...`, `py-...`) to tweak button/badge/card sizes. Always use the built-in `size` prop (`sm`, `default`, `lg`, `icon`, `icon-sm`).
- **No Manual Button Re-styling — Prioritize Variants**: Do NOT re-style or manually override the `<Button>` component's styles (e.g. overriding `border`, `rounded`, `bg`, `shadow`, or padding). The system's `Button` component already provides a full set of `variant`s (`default`, `secondary`, `outline`, `ghost`, `subtle`, `destructive`) and `size`s (`default`, `sm`, `lg`, `icon`, `icon-sm`). You MUST use the existing `variant` and `size` props directly.
- **No Manual Dialog / Modal Re-styling**: NEVER manually override background overlays (`bg-background/95`, `backdrop-blur-*`), border styles (`border-border/60`), custom padding, or rounded corners on `<DialogContent>` or `<DialogHeader>`. Standard UIKit Dialog already defines standard surface, elevation, and close button. Sizing classes should strictly only manage dimensional constraints (e.g. `w-[94vw] sm:max-w-5xl md:max-w-6xl h-[86vh] flex flex-col overflow-hidden`). Never inject arbitrary divider lines (`border-b`, `border-t`) into headers or content unless explicitly requested.
- **Strict Prohibition on Redundant Cancel Buttons (MANDATORY)**: NEVER add a redundant "Cancel" / "Hủy" button to `DialogFooter` in dialogs or modals when a top-right Close ('X') icon or backdrop dismiss action is active. Keep `DialogFooter` focused strictly on primary action buttons.
- **No Nested Button in Link**: NEVER nest `<Button>` inside a Next.js `<Link>` or vice versa. Style `<Link>` directly, or use `asChild`.
- **Card Component & Zero-Override Rule (MANDATORY)**:
  - ALWAYS use the global `<Card>` component from `@lumen/uikit/components`. Use `default` (standard surface) for outer containers and `variant="muted"` (with `size="sm"`) for inner informational cards, stat chips, and nested stage blocks. NEVER invent ad-hoc `div` containers with repetitive custom `bg-muted/... rounded-...` classes.
  - **No Manual Card Re-styling**: NEVER manually override or inject custom `shadow-*`, custom `rounded-*`, custom `border-*`, or custom `bg-*` onto `<Card>`. Use `variant` and `size` directly.
  - **Zero-Hover on Non-Interactive Elements (MANDATORY)**: Cards, tiles, badges, or list items that have NO click action, NO `onClick`, and NO `href` MUST NEVER have hover effects (`hover:bg-...`, `hover:scale-...`, `hover:shadow-...`, `hover:border-...`) or `cursor-pointer`. Interactive states are strictly reserved for clickable components.

### 3.4 Anti-Border / Anti-Card-Clutter Aesthetics (MANDATORY)

- **Minimize Border Usage**: Do NOT overuse hard borders (`border`, `border border-border/80`, `border-border/50`). Lumen's design language is flat, airy, subtle, and modern.
- **Avoid Card/Background Overuse (Anti-Card-Clutter / Anti-Box-in-Box)**: Do NOT wrap individual rows, paragraphs, or list items in separate background boxes (`bg-muted/20`, `bg-muted/30`, `rounded-2xl border...`). Use the Dialog's/Page's native background surface combined with natural spacing (padding/gap) and typography hierarchy.

---

## 4. Internationalization (i18n)

- **No Hardcoded Text**: NEVER hardcode UI text strings in JSX. All text must be extracted into `en.json` and `vi.json` and accessed via `useTranslations()` from `next-intl`.
- **Translation Key Casing**: All keys in translation JSON files (`en.json`, `vi.json`) MUST strictly use `camelCase`.
- **No i18n Fallbacks**: Do NOT use the `fallback` parameter in `useTranslations` or `t()`.
- **No Ad-hoc Dictionaries**: All display text MUST be centralized in `messages/{locale}.json` and rendered through `useTranslations` in the UI layer only.

---

## 5. Routing & Navigation

- **Route Parameters**: Read route parameters using `useParams()` from `next/navigation`.
- **Navigation via `RouteEnum`**: ALL programmatic navigation MUST use `RouteEnum` from `@/shared/constants`. For dynamic segments (`:id`), use `formatUrl` from `@lumen/shared-api`.
- **Portal & Floating UI**: Use `@lumen/uikit/portal` (`usePortal` or `usePortalWithoutBackdrop`).

---

## 6. Service & API Layer

- **Mapper Registry Required**: ALL API endpoints MUST be explicitly registered in a `MapperRegistry` (`[feature].registry.ts`).
- **Raw Data Typing in Mappers**: In mapper files (`[feature].mappers.ts`), raw backend data MUST be typed simply as `any` (e.g. `(raw?: any)`). A mapper's sole responsibility is to take `raw: any` and map it directly into the clean, strongly-typed frontend model.
- **Strict Domain Separation Across Services**: Service modules in `services/` MUST be strictly separated along business domain boundaries — never merge multiple domains into a single service.
- **Clean Service Import Convention (MANDATORY)**: Import directly from domain root modules (e.g., `import { VocabularyWord } from '@/services/vocabulary';`). NEVER import deep internal files.

---

## 7. DTO & Model Types (Strict)

- **Enums for Strict Values**: Use TypeScript Enums (e.g., `MaterialTypeEnum`, `FlashcardRating`) instead of inline string/numeric literal unions.
- **No Magic Numbers / Magic Strings**: All fixed values, configuration, and keyboard shortcuts MUST be defined via a semantically clear Enum or Constant.
- **Strict Type Certainty (No Careless `?` / `| null`)**: Only use `?` when a field is genuinely optional, and `| null` when backend intentionally sends `null`. Never write `?: string | null`.

---

## 8. Code Commenting (Strict)

- **No Redundant or Self-Evident Comments**: Comments are ONLY allowed at genuinely complex points (algorithms, unusual edge cases). If code is not genuinely complex, do NOT add any comments.
- Write comments in concise English.

---

## 9. Zero-Workaround & Zero-Anti-Pattern Policy (MANDATORY)

1. **Service Layer Leaking into UI**: Service layer must never import UI components, fire `toast`, parse cookies/DOM, or navigate via `window.location`.
2. **Duplicate Dictionaries / Ad-hoc i18n**: All text in `messages/{locale}.json`.
3. **Workarounds & Compatibility Aliases**: No bridge aliases (`export const useCreateDeck = useCreateFolder;`).
4. **Coupled / Ping-Pong State Hooks**: No circular state coupling between hooks.
5. **Careless Type Bypasses**: No `any` or `as unknown as T` in components.

---

## 10. Content & Copywriting Neutrality (Strict)

- **No Hardcoded Specialized Content**: Keep platform features generic and neutral. Specialized domain terms (TOEIC, IELTS) belong ONLY inside dedicated modules.
- **No Redundant Count Badges in Headers**: Never append count numbers or pill badges next to section titles/headings unless explicitly requested.

---

## 11. Hook Length Limit & Loose Coupling (MANDATORY)

- **Custom Hook Length Limit**: Custom hooks MUST NOT exceed **300 lines of code**.
- **Loose Coupling**:
  1. **Pure Utilities First**: Extract calculations to pure functions in `utils/`.
  2. **Single Source of Truth**: Manage core state centrally.
  3. **Independent Sub-hooks**: Sub-hooks must be unidirectional and independent.

---

## 12. Testing & Verification Policy (MANDATORY)

- **No Browser Automation for Testing**: NEVER open a browser (`browser_subagent`, Puppeteer).
- Check correctness via code inspection, `tsc --noEmit`, `eslint`, or terminal tests.

---

## 13. Base UI Component Triggers (MANDATORY)

- **Use `render` Prop for Base UI Triggers**: Component triggers built on Base UI MUST use `render={<button ... />}` instead of `asChild`. `asChild` is strictly forbidden on Base UI trigger components.

---

## 14. HTTP Service Query Serialization & Over-fetching Prevention (MANDATORY)

- **Direct Query Parameter Passing**: Pass params directly as 2nd argument in `this._get(url, params)`. NEVER wrap query parameters in an extra `{ params }` object.
- **No Over-fetching for UI Counter Badges**: Get metrics directly from overview endpoints (`GET /overview`).
- **Explicit Parameterized Limits**: Pass explicit `limit` parameters according to UI needs.

---

## 15. Z-Index & Portal Layering (MANDATORY)

- **Portal & Overlay Scale Standard**:
  - Background/inactive stacked portals: `zIndex = 98`
  - Overlay backdrop: `zIndex = 99`
  - Active top portal: `zIndex = 100`

## 16. Feature Planning & Business Analysis (From .agents/AGENTS.md)

- **Source of Truth**: Every new feature or major technical enhancement MUST have a dedicated feature document saved in `documents/features/[feature-name].md`.
- **Pre-Implementation Requirement**: Before writing or modifying source code for a non-trivial feature, create or update the corresponding feature plan.
- **Living Document**: Update the status and checklist in `documents/features/[feature-name].md` as work progresses until completion.
- **Feature Plan Template**: Every file in `documents/features/[feature-name].md` MUST strictly follow the standardized markdown template with sections: Overview & Objectives, Requirements & Scope (Functional & Non-Functional), Out of Scope, Architecture & Technical Contracts, File Change Matrix, Implementation & Quality Verification Checklist, Risks & Technical Considerations, and Workflow & Usage Instructions.
- **File Change Matrix**: Track all file changes using the matrix format: Action, File Path, Purpose.
- **Implementation & Quality Verification Checklist**: Must run type checks (`tsc --noEmit`) and build scripts in both `backend` and `frontend`, verify no `any` type bypasses, no manual re-styling of `<Button>` components, all custom React hooks <= 300 lines, clean domain separation, and no hardcoded UI text strings.
- **Risks & Technical Considerations**: Highlight potential edge cases, breaking changes, or risks with code examples.
- **Workflow & Usage Instructions**: Follow the standardized workflow: creating a plan, executing step-by-step, and verifying/completing with all checklist items marked.
- **UI/UX Specifications**: Standard HSL tokens, flat modern aesthetic, no manual button re-styling, anti-box-in-box design, Base UI triggers using `render={<Element />}` prop, Z-Index layering (98/99/100), i18n localization with `camelCase` keys in `messages/{locale}.json`.
- **Service Layer Leaking into UI**: Service layer must never import UI components, fire `toast`, parse cookies/DOM, or navigate via `window.location`.
- **Duplicate Dictionaries / Ad-hoc i18n**: All text in `messages/{locale}.json`.
- **Workarounds & Compatibility Aliases**: No bridge aliases (`export const useCreateDeck = useCreateFolder;`).
- **Coupled / Ping-Pong State Hooks**: No circular state coupling between hooks.
- **Careless Type Bypasses**: No `any` or `as unknown as T` in components.
- **No Hardcoded Specialized Content**: Keep platform features generic and neutral. Specialized domain terms (TOEIC, IELTS) belong ONLY inside dedicated modules.
- **No Redundant Count Badges in Headers**: Never append count numbers or pill badges next to section titles/headings unless explicitly requested.
- **No Browser Automation for Testing**: NEVER open a browser (`browser_subagent`, Puppeteer).
- **Content & Copywriting Neutrality (Strict)**: Platform features must remain completely generic, neutral, and versatile. Specialized domain terms may ONLY be used within modules that are strictly dedicated to that specific purpose.

---

## 17. React Hook Dependencies & Stable References Rule (MANDATORY)

- **No Redundant Stable References in Dependency Arrays**:
  - Stable setters (`setState`, `setIsFlipped`, `setOpen`, `useToggle` dispatchers), store actions, and stable helper functions that never change MUST NOT be added to `useEffect`, `useCallback`, or `useMemo` dependency arrays.
  - Adding stable setters/functions unnecessarily bloats dependency lists without providing any functional benefit.
  - Dependency arrays must strictly contain only actual dynamic state, props, or variables that need to trigger re-execution when their values change.
  - `react-hooks/exhaustive-deps` is disabled in ESLint to avoid forcing meaningless stable dependencies.

---

## 18. Zero Hardcoded Display Copy in Constants & Configs (MANDATORY)

- **Pure Data in Configs**: Constants and configuration objects (such as `LESSON_QUOTA_CONFIGS`) MUST strictly contain raw domain data, numeric thresholds, enums, keys, or technical parameters only.
- **No Human-Readable Labels or Formatted Strings in Configs**: NEVER embed localized descriptions, labels, or range strings (e.g. `'7-10 questions'`, `'Few'`) in config objects.
- **Dynamic Localization in UI**: All human-facing text must be rendered dynamically via `useTranslations` in React components, passing numeric thresholds from configs as parameters (e.g. `t('quotaQuestionsRange', { min: config.minCount, max: config.maxCount })`).

---

## 19. Strict CSS-First Responsive & Anti-Hydration-Mismatch Rule (MANDATORY)

- **100% CSS-First for Layout, Spacing, and Visibility**:
  - Always use native Tailwind CSS responsive utility classes (`hidden md:block`, `flex md:hidden`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, `w-full lg:w-auto`) for all responsive layouts, component visibility, sizing, and spacing.
  - **Zero JSX Branching on Screen Size**: NEVER use JavaScript viewport checks or hooks (`useMediaQuery`, `useBreakpoint`, `window.innerWidth`) to conditionally mount/unmount UI layout trees (e.g. `{isMobile ? <MobileNav /> : <DesktopNav />}`). Doing so causes severe **SSR Hydration Mismatches** and **Cumulative Layout Shift (CLS)** because the server cannot know the client's screen size during SSR.
- **Strictly Limited JS Hook Usage (`useBreakpoint` / `useMediaQuery`)**:
  - `useBreakpoint` / `useMediaQuery` from `@lumen/hooks` is ONLY permitted for imperative, non-visual JavaScript logic that CSS cannot handle (e.g., dynamic chart canvas pixel dimensions in Recharts, portal/popover positioning strategies, attaching touch/drag gestures only on mobile devices).

---

## 20. Strict Keyboard Listener & Shortcut Rule (`useKeyPress`) (MANDATORY)

- **Use `useKeyPress` from `@lumen/hooks`**:
  - For single or multi-key keyboard event detection, ALWAYS use the shared `useKeyPress` hook from `@lumen/hooks`.
  - Avoid ad-hoc `window.addEventListener('keydown')` blocks that risk memory leaks, stale closures, or fire inappropriately while the user is typing in `<input>` / `<textarea>`.
  - Ensure shortcuts specify explicit `modifierKeys` (e.g. `ctrlOrMeta: true`) and respect `ignoreInputElements: true` by default.

---

## 21. Strict Universal Multilingual Schema & Generic Helpers Rule (`i18nText`, `toI18nString`, `getSecondaryI18nText`) (MANDATORY)

- **Uniform Multilingual Data Schema**: All dynamic multilingual data fields across Backend (Entities, DTOs, DB columns) and Frontend (Types, Mappers) MUST strictly and exclusively use the uniform `I18nString` schema (`Partial<Record<Locale, string>> & Record<string, string>`).
- **Zero Schema Ad-hoc / Bypasses**: Absolutely NEVER create ad-hoc field variations like `definitionEn`, `translationVi`, `sentenceEn`, `topicVi`, `viName`, `enName` or custom property suffixes across entities, mappers, or DTOs.
- **Strict Prohibition on Manual Indexing & Raw Property Access on `I18nString`**:
  - ABSOLUTELY NEVER access raw property fields or manual indexing (`obj.en`, `obj.vi`, `obj['en']`, `.[0]`) on `I18nString` objects.
  - ALWAYS resolve text via the generic `i18nText(target, Locale.EN)` or `i18nText(target, locale)` passing `Locale` from the enum.
  - If querying or matching against `I18nString`, ALWAYS use `includesI18n(input, query)`.
- **Mandatory Enums for Fixed Predefined Values**:
  - Any domain concept, setting, configuration, or parameter that has predefined fixed values and can be used as a type MUST strictly and exclusively be defined as a TypeScript `enum` (e.g. `Locale`, `StudySessionMode`, `FlashcardRating`, `PronunciationAccent`, `MaterialTypeEnum`, `RouteEnum`).
  - NEVER use bare string literals (`'en'`, `'vi'`) or string literal unions (`'en' | 'vi'`) when defining core schemas, parameters, or types.
- **Single Universal Data Mapper (`toI18nString`)**: All incoming raw JSONB / object data in mappers MUST be parsed through `toI18nString(raw)` from `services/core/core.mappers.ts`. It returns `{}` without redundant fallback strings.
- **Universal Text Resolvers with Switch-Case**:
  - `i18nText(input, locale = Locale.EN)`: Resolves active locale from `I18nString` via a clean `switch (locale)` structure.
  - `getSecondaryI18nText(input, currentLocale = Locale.EN)`: Resolves an alternative non-active translation via `switch (currentLocale)` without hardcoded two-language swaps.
- **Dynamic User Native Language Checking**:
  - Always check user's active native language via `const locale = useLocale()` from `@/shared/hooks` returning `Locale` enum directly.
  - NEVER write hardcoded language ternaries in JSX (e.g. `{locale === Locale.VI ? 'Tiếp tục' : 'Finish'}`). All static copy MUST reside in `messages/{locale}.json` and be rendered via `t('key')` or `t.rich('key', ...)`.
- **Zero Derivative / Duplicate Helpers & Zero Redundant Type Aliases**:
  - Do NOT create ad-hoc functions like `getLocalizedText`, `getLocalizedTopicName`, `getLocalizedWordMeaning`, or `resolveDefinitionMeaning`. Use `i18nText` and `getSecondaryI18nText` directly.
  - NEVER create redundant type alias reassignments (`type I18nMap = ...; type I18nString = I18nMap;`, `export const useAppLocale = useLocale;`). Keep definitions simple, direct, and uncluttered.
  - Eliminate redundant fallback checks and redundant nested `if` statements. Keep pure logic clean and minimal.

---

## 23. Strict Prohibition on Meaningless Re-assignments, Redundant Fallbacks & Redundant Logic (MANDATORY)

- **Zero Meaningless Re-assignments**: ABSOLUTELY NEVER perform meaningless re-assignments of variables, properties, or fields back to themselves or through identity functions/utils when types already match (e.g. `const x = x`, `const title = toI18nString(command.title)` when `command.title` is already typed as `I18nString`). Pass typed parameters directly to constructors, functions, domain aggregates, and database calls without useless intermediate wrappers.
- **Zero Redundant Fallbacks & Over-defensive Logic**: ABSOLUTELY NEVER add redundant nullish coalescing operators (`?? ''`, `|| ''`, `?? []`, `|| {}`), speculative ternaries, or redundant `if-else` guard blocks when a field, array, or object is already guaranteed by TypeScript types or schema contracts. Eliminate redundant fallback checks and redundant nested `if` statements across services, mappers, handlers, and components. Keep pure logic clean, minimal, and direct.
- **Zero Redundant Code & Dead Logic**: Keep all execution paths concise, direct, and minimal. Strictly eliminate dead code branches, unused helper calls, duplicate assignments, and unnecessary boilerplate wrappers.





