# Lumen Project Master Rules

Before making any modifications or writing code, consult the appropriate skill in `.agents/skills/`:

- For feature planning and requirements analysis: consult the `ba` skill (`.agents/skills/ba/SKILL.md`) or `brainstorming`/`writing-plans`.
- For backend development: consult the `backend` skill (`.agents/skills/backend/SKILL.md`).
- For frontend development: consult the `frontend` skill (`.agents/skills/frontend/SKILL.md`).
- For testing, QA, and test case specifications: consult the `qc` skill (`.agents/skills/qc/SKILL.md`) and `test-driven-development`.
- For execution workflows, debugging & subagent management: consult the Superpowers skills (`subagent-driven-development`, `systematic-debugging`, `executing-plans`, `verification-before-completion`).


DO NOT ignore these skills. The architectural, design system, and syntax rules for each domain are maintained inside their respective skill instructions.

---

# Agent Communication Style Rule
- Answer straightforwardly, concisely, and directly to the technical problem.
- DO NOT use emotions, flowery language, or exclamations.
- Focus entirely on error analysis, proposing solutions, and reporting execution results.
- Write all code comments in English.

---

# Strict Code Commenting Rule
- ABSOLUTELY NO redundant or self-evident comments (do not explain variable names, function names, standard execution flow, props, JSX...).
- Comments are ONLY permitted at genuinely critical points handling exceptionally complex logic or complex algorithms.
- Unless the code is exceptionally complex, DO NOT add any comments.
- All code comments (if any) MUST be written in concise, accurate English.

---

# Agent Quality Assurance Rule
- ALWAYS be meticulous and thorough. DO NOT push code immediately without verifying.
- Before committing and pushing code, MUST run `tsc -b` and `eslint` or the project's build command locally to ensure there are no hidden type errors or linting issues.
- Never guess fixes; verify them thoroughly by running the actual build process locally.

---

# Strict Zero-Workaround & Zero-Anti-Pattern Rule (MANDATORY)
- **ABSOLUTELY NO WORKAROUNDS OR ANTI-PATTERNS**:
  - Unless explicitly requested by the user in the current prompt, ANY anti-pattern or workaround is STRICTLY FORBIDDEN.
  - Never take shortcuts, apply temporary quick fixes/hacks, or bypass technical constraints through anti-architectural patches.
  - All solutions MUST strictly adhere to Clean Architecture, Single Source of Truth, and Separation of Concerns from the start.
  - Strictly Forbidden Anti-Patterns & Workarounds:
    1. **Service Layer Leaking into UI (Mixing Presentation & Data Layer)**: The HTTP Client / Service layer (`CoreService`, API services) MUST NOT import UI components, MUST NOT trigger `toast`, MUST NOT parse cookies/DOM/URL to guess UI state, and MUST NOT navigate via `window.location`. Services interact solely with HTTP, mappers, and domain state (Zustand store / Events).
    2. **Duplicate Dictionary / Ad-hoc i18n**: NEVER define custom dictionary objects or custom translation functions in services/utils. All display copy MUST be centralized in `messages/{locale}.json` and rendered via `useTranslations` from `next-intl` in the UI layer.
    3. **Workarounds & Compatibility Aliases**: NEVER create alias bridges (`export const useCreateDeck = useCreateFolder;`, `export type Deck = Folder;`) to avoid refactoring. Refactor thoroughly across the entire codebase.
    4. **Coupled / Ping-Pong State Hooks**: NEVER split a single state flow into mutually interdependent hooks (hook A calls hook B, and hook B sends callbacks back to hook A). Centralize state in a Single Source of Truth and use Pure Functions.
    5. **Careless Type Bypasses**: NEVER use `any`, `as any`, or `as unknown as T` to bypass the TypeScript compiler.

---

# Content & Copywriting Neutrality Rule
- NEVER inject or hardcode specialized domain terms (such as "TOEIC", "IELTS", specific certifications, or specialized test names) into general application copy, section titles, headers, badges, or input placeholders.
- General features, vocabulary, flashcards, decks/folders, dashboard, settings, and UI components must remain completely generic, neutral, and versatile.
- Specialized domain terms may ONLY be used within modules that are strictly dedicated to that specific purpose (e.g., an actual TOEIC mock test module).
- NEVER append redundant count numbers or pill badges (e.g. `(0)`, `[count]`, or `<span ...>{items.length}</span>`) next to section titles, headings, or category labels unless explicitly requested by the user. Section headers must remain clean and minimalist.

---

# Strict UI Aesthetics & Anti-Border / Anti-Card-Clutter Convention (MANDATORY)
- **Strictly Limit Border Usage**: NEVER overuse hard borders (`border`, `border border-border/80`, `border-border/50`). Lumen's design language is flat, airy, subtle, and modern.
- **Strictly Avoid Background Card Overuse (Anti-Card-Clutter / Anti-Box-in-Box)**:
  - DO NOT wrap individual rows, paragraphs, or list items in separate background boxes (`bg-muted/20`, `bg-muted/30`, `rounded-2xl border...`).
  - Strictly eliminate "box-in-box" nesting that creates visual clutter and claustrophobic layouts.
  - Use native background surfaces of Dialogs / Pages combined with natural spacing (padding/gap) and typography hierarchy.
- **Strict Prohibition on Background Boxes / Circles Around Icons (MANDATORY)**:
  - NEVER place background boxes, colored circles, or surface wrappers (`bg-amber-500/10`, `bg-primary/10`, `rounded-full bg-...`, `w-16 h-16 rounded-full bg-...`) behind icons (such as `<StreakIcon>`, header title icons, or card icons).
  - Icons MUST be rendered standalone, clean, and borderless directly on their native container background. Always use dedicated icon components (such as `<StreakIcon size={56} />`).

---

# Strict Prohibition on Opening Browser for Testing (MANDATORY)
- ABSOLUTELY NEVER OPEN A BROWSER (do not use `browser_subagent`, Puppeteer, or any browser automation) to test UI or features. Pages and features require user authentication that the agent cannot perform.
- All correctness verifications must be performed via code inspection, logic analysis, running `tsc --noEmit`, running `eslint`, or terminal tests.

---

# Strict Zero-Customization & Design System Component Fidelity Rule (MANDATORY)
- **Zero-Customization Policy on Shared / UIKit Components**:
  - Whenever using shared UIKit components (`<Button>`, `<Card>`, `<Badge>`, `<Dialog>`, `<Sheet>`, `<Input>`, `<Avatar>`, etc.), NEVER arbitrarily override, tweak, or patch styles via `className`.
  - **Strictly Forbidden Overrides**:
    1. **NO Custom `shadow-*`**: Absolutely NEVER inject `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, or `shadow-none` onto UIKit components. Components manage their own elevation tokens.
    2. **NO Custom `rounded-*`**: Absolutely NEVER inject `rounded-3xl`, `rounded-2xl`, `rounded-full`, `rounded-lg`, `rounded-md`, or `rounded-none` onto UIKit components. Components already have standard design tokens (e.g. `rounded-xl`).
    3. **NO Custom `border-*` or `bg-*`**: Absolutely NEVER inject `border-none`, `border-border/...`, `bg-card`, `bg-muted/...` directly. Always use the built-in `variant` prop (`default`, `muted`, `subtle`, `outline`, etc.).
    4. **NO Custom Padding / Sizing Overrides**: Absolutely NEVER write ad-hoc padding (`p-...`, `px-...`, `py-...`) or height/width classes (`h-9`, `w-...`) on `<Button>`, `<Badge>`, or `<Card>` to tweak sizes. ALWAYS use the component's `size` prop (`sm`, `default`, `lg`, `icon`, `icon-sm`).
  - **Single Source of Truth**: Shared components are global design standards. Never patch "a little size, a little shadow, a little rounded" locally in features.

---

# Button Styling Rule
- **No Manual Button Re-styling (Prioritize Variants)**: NEVER arbitrarily re-style or manually override styles (e.g. overriding `border`, `rounded`, `bg`, `shadow`, padding) on `<Button>`. The system's `Button` component already provides a full set of `variant`s (`default`, `secondary`, `outline`, `ghost`, `subtle`, `destructive`) and `size`s (`default`, `sm`, `lg`, `icon`, `icon-sm`). You MUST use existing `variant` and `size` props directly.

---

# Badge Styling Rule (MANDATORY)
- **No Manual Badge / Pill Re-styling (Prioritize Variants)**: NEVER write ad-hoc repetitive inline badge/pill boilerplate (`px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600...`, `bg-amber-500/10 text-amber-600...`, etc.).
- ALWAYS use the centralized `<Badge>` component from `@lumen/uikit/components`.
- Use the built-in `variant` (`default`, `secondary`, `subtle`, `outline`, `solid`, `success`, `warning`, `destructive`, `info`) and `size` (`sm`, `default`, `lg`) props directly.

---

# Card Component & Zero-Hover Rule (MANDATORY)
- **Use `<Card variant="muted">` for Inner Informational Blocks**: ALWAYS use `<Card variant="muted" size="sm">` from `@lumen/uikit/components` for inner informational cards, stat chips, and nested stage blocks instead of writing custom `div` boxes with repetitive `bg-muted/... rounded-...` classes.
- **No Manual Card Re-styling (Prioritize Variants & Zero-Override)**: NEVER manually override or inject custom `shadow-*` (`shadow-sm`, `shadow-xs`, `shadow-md`, `shadow-xl`), custom `rounded-*` (`rounded-3xl`, `rounded-2xl`), custom `border-*` (`border-none`), or custom `bg-*` (`bg-card`) onto `<Card>`. Use `variant` and `size` directly.
- **Zero-Hover on Non-Interactive Elements**: Cards, tiles, badges, or list items that have NO click action, NO `onClick`, and NO `href` MUST NEVER have hover effects (`hover:bg-...`, `hover:scale-...`, `hover:shadow-...`) or `cursor-pointer`. Interactive states are strictly reserved for clickable components.
- **Clean Row Hover State (No Image Scaling or Secondary Side-effects)**: Interactive list items, folder rows, card rows, or table items MUST strictly only update their container background color (e.g. `hover:bg-muted/50`) when hovered. NEVER add image scaling (`group-hover:scale-105`), icon movement, text color shifts, or nested transform effects on child elements when hovering over a row.

---

# Strict Dialog & Modal Styling Rule (MANDATORY)

- **No Manual Dialog / Modal Re-styling**:
  - NEVER arbitrarily re-style or manually override background overlays (`bg-background/95`, `backdrop-blur-*`), border styles (`border-border/60`, `border-border/50`), padding, or rounded corners on `<DialogContent>` or `<DialogHeader>`.
  - The standard `Dialog` component in UIKit (`@lumen/uikit/components`) already defines the standard surface, backdrop, elevation, and close button.
  - Dialog styling MUST strictly only define responsive dimension constraints (e.g. `w-[94vw] sm:max-w-5xl md:max-w-6xl h-[86vh] max-h-[900px] flex flex-col overflow-hidden`) without overriding background, border, or padding.
  - NEVER inject arbitrary divider lines (`border-b`, `border-t`, `divide-*`) into `DialogHeader` or dialog bodies unless explicitly requested by the user.
- **Strict Prohibition on Redundant Cancel Buttons (MANDATORY)**:
  - NEVER add a redundant "Cancel" / "Hủy" button to `DialogFooter` in dialogs or modals when a top-right Close ('X') icon or backdrop dismiss action is already active.
  - Closing via top-right Close ('X') icon or clicking the backdrop overlay already serves as the standard dismiss mechanism.
  - `DialogFooter` MUST strictly only contain primary action buttons (e.g., `<Button>{t('saveChanges')}</Button>`) to keep UI clean, focused, and free of redundant clutter.

---

# Strict Directory Structure, Re-export, and Type Placement Rule (MANDATORY)
- **Separation of Concerns by Directory**:
  - `components/`: MUST contain React UI components (`.tsx`) ONLY. Never place non-component files (constants, animation variants, configs, utils, types) inside `components/`. Create dedicated folders instead (`constants/`, `hooks/`, `types/`, `utils/`).
  - `constants/`: Holds constants, static configs, and animation variants (e.g. `animations.ts`).
  - `hooks/`: Holds React custom hooks (`use-[name].ts`).
  - `types/`: Holds domain types, feature models, and shared interfaces (`[feature].types.ts`).
- **Re-export Convention**:
  - Hooks and Constants MUST be re-exported centrally through an `index.ts` file in their own directory (e.g. `hooks/index.ts`, `constants/index.ts`).
  - Components DO NOT re-export via `index.ts`; import directly from component files to preserve tree-shaking and code-splitting.
- **Type Placement Convention**:
  - Hook-specific props/return types (`Use[Name]Props`, `Use[Name]Return`) should be defined directly in that hook's file (or in `use-[name].types.ts` if too large).
  - Domain / Entity / Shared Types (such as `MissedWordStat`, models, data structures) MUST NEVER live inside `hooks/`. They MUST be placed in the module's `types/` directory.

---

# Strict Service & API Domain Separation Rule (MANDATORY)
- Service modules in `services/` MUST be strictly separated along business domain boundaries. Never merge multiple domains into a single service.
- For example: Domain `vocabulary` (words, folders, flashcard CRUD) and domain `study` (`dueFlashcards`, `reviewFlashcard`, study sessions) MUST remain two separate services (`services/vocabulary` and `services/study`), with corresponding hooks separated in their respective features (`features/vocabulary/hooks` and `features/study/hooks`).
- **Clean Service Import Convention (MANDATORY)**:
  - When importing types, models, keys, or functions from a domain service, MUST import directly from the root module of that domain (e.g. `import { VocabularyWord, Folder } from '@/services/vocabulary';`, `import { User } from '@/services/auth';`, `import { DueFlashcard } from '@/services/study';`).
  - NEVER import deep internal files like `@/services/vocabulary/vocabulary.types`, `@/services/study/study.types`, `@/services/auth/auth.types`, or `@/services/progress/progress.types`.
  - Every service module MUST re-export all types, keys, and services via its root `index.ts`.

---

# Strict Constants, Enums & Type Certainty Rule (MANDATORY)
- **No Hardcode & Magic Values**: NEVER hardcode magic strings, numbers, or shortcuts. All shortcuts, configs, and ratings MUST be defined via explicit Enums/Constants (e.g. `StudyShortcutKey { FLIP_SPACE = 'Space', MASTERED = '1', ... }`).
- **Zero Hardcoded Display Copy in Constants & Configs (MANDATORY)**: Constants and configuration objects (e.g. `LESSON_QUOTA_CONFIGS`) MUST strictly contain only raw domain data, numeric thresholds, enums, keys, or technical parameters. NEVER put human-readable labels, subtitles, or localized descriptions (such as `'7-10 questions'`, `'Few'`) in config objects. All display copy MUST reside in i18n message catalogs (`messages/{locale}.json`) and be composed dynamically via `useTranslations` in UI components using parameters (e.g. `t('quotaQuestionsRange', { min: config.minCount, max: config.maxCount })`).
- **No Careless `?` and `| null` Abuse**: Ensure exact data schemas. Never add `?` or `| null` carelessly when a field is guaranteed (e.g. if mappers always return empty arrays `[]`, the type is `T[]`). Only use `?` when genuinely optional and `| null` when backend intentionally sends `null`. Never write `?: string | null`.

---

# Strict Hook Length Limit & Loose Coupling Rule (MANDATORY)
- **Custom Hook Length Limit**: A React custom hook MUST NOT exceed **300 lines of code**.
- **No Interdependent Hook Coupling (Anti-Coupled Hooks / Anti-Ping-Pong State)**:
  - When decomposing logic to satisfy line limits, NEVER split a single business state flow into mutually dependent custom hooks.
  - MUST adhere to:
    1. **Pure Utilities First**: Extract calculations, transformations, algorithms, queue logic, and rating mappings into Pure Functions in `utils/`.
    2. **Single Source of Truth**: Core state of a flow must be centrally managed in one place.
    3. **Independent, Unidirectional Sub-hooks**: Sub-hooks (like audio players or keyboard listeners) must be completely independent and receive only required inputs in a unidirectional flow.

---

# Strict Shared DTO Inheritance & SOLID Generic Code Reuse Rule (MANDATORY)
- **Inherit Shared DTOs**: All request/query endpoints with pagination (`page`, `limit`) MUST inherit `PaginationDto` (or `BaseFilterDto` if supporting `search`, `sortBy`, `sortOrder`) from `shared/presentation/dtos/pagination.dto.ts`. NEVER declare loose query params `@Query('page')` or duplicate pagination fields in custom DTOs.
- **Inherit Shared CQRS Queries**: All CQRS Query classes handling pagination MUST inherit `PaginatedQuery` (or `BaseFilterQuery`) from `shared/application/cqrs/paginated.query.ts`.
- **Single Source of Truth for Defaults**:
  - `PaginationDto` and `PaginatedQuery` are the ONLY single source of truth for request defaults (`page = 1, limit = 20`).
  - Subclass DTOs and Queries MUST NOT override base default values arbitrarily.
  - Repositories and Domain Services MUST NOT declare default value initializers (`page = 1, limit = 20`) or fallback operators in method signatures. They receive exact typed arguments passed from handlers.
- **Prioritize Generic & DRY Code Reuse**: Standard structures, utilities, DTOs, and wrappers built in `shared/` (such as `PaginationDto`, `BaseFilterDto`, `PaginatedResponseDto`, `PaginatedQuery`, `BaseFilterQuery`, base entities, decorators, mappers) MUST be reused directly. NEVER duplicate existing logic/schemas.
- **Adhere to SOLID Principles**: Ensure Single Responsibility for each handler/DTO, Open/Closed through inheritance from base DTOs/classes, and Interface Segregation across independent query/command ports.

---

# Strict React Hook Dependencies & Stable References Rule (MANDATORY)
- **No Redundant Stable References in Dependency Arrays**:
  - Stable setters (`setState`, `setIsFlipped`, `setOpen`, `useToggle` dispatchers), store actions, and stable helper functions that never change MUST NOT be added to `useEffect`, `useCallback`, or `useMemo` dependency arrays.
  - Adding stable setters/functions unnecessarily bloats dependency lists without providing any functional benefit.
  - Dependency arrays must strictly contain only actual dynamic state, props, or variables that need to trigger re-execution when their values change.
  - `react-hooks/exhaustive-deps` is explicitly disabled in ESLint config.

---

# Strict CSS-First Responsive & Anti-Hydration-Mismatch Rule (MANDATORY)
- **100% CSS-First for Layout and Visibility**:
  - Always use native Tailwind CSS responsive utility classes (`hidden md:block`, `flex md:hidden`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, `w-full lg:w-auto`) for all responsive layout, component visibility, sizing, and spacing.
  - **Zero JSX Branching on Screen Size**: NEVER use JavaScript viewport checks or hooks (`useMediaQuery`, `useBreakpoint`, `window.innerWidth`) to conditionally mount/unmount UI layout trees (e.g. `{isMobile ? <MobileNav /> : <DesktopNav />}`). Doing so causes severe **SSR Hydration Mismatches** and **Cumulative Layout Shift (CLS)** because the server cannot know the client's screen size during SSR.
- **Strictly Limited JS Hook Usage (`useBreakpoint` / `useMediaQuery`)**:
  - `useBreakpoint` / `useMediaQuery` is ONLY permitted for imperative, non-visual JavaScript logic that CSS cannot handle (e.g., dynamic chart canvas pixel dimensions in Recharts, portal/popover positioning strategies, attaching touch/drag gestures only on mobile devices).

---

# Strict Keyboard Listener & Shortcut Rule (MANDATORY)
- **Use `useKeyPress` from `@lumen/hooks`**:
  - For single or multi-key keyboard event detection, ALWAYS use the shared `useKeyPress` hook from `@lumen/hooks`.
  - Avoid ad-hoc `window.addEventListener('keydown')` blocks that risk memory leaks or fire inappropriately while the user is typing in `<input>` / `<textarea>`.
  - Ensure shortcuts specify explicit `modifierKeys` (e.g. `ctrlOrMeta: true`) and respect `ignoreInputElements: true` by default.

---

# Strict Git Commit & Push Rule (MANDATORY)
- **Explicit User Request in Current Prompt Only**: NEVER execute git commit or git push automatically unless explicitly instructed by the user in the CURRENT prompt.
- **Pushing Existing State Only**: When the user requests to "push" or "push code trước rồi làm", it STRICTLY means: commit and push ONLY the existing completed code currently in the workspace BEFORE writing or editing any code for the upcoming request.
- **Never Mix Future/New Task Changes**: Never combine new, upcoming, or unverified task modifications into a push requested for the existing state. Always push existing code first, and keep subsequent work uncommitted until confirmed.

---

# Strict Universal Multilingual Schema & Generic Helpers Rule (MANDATORY)
- **Uniform Multilingual Data Schema**: All dynamic multilingual data fields across Backend (Entities, DTOs, DB columns) and Frontend (Types, Mappers) MUST strictly and exclusively use the uniform `I18nString` schema (`Partial<Record<Locale, string>> & Record<string, string>`).
- **Zero Schema Ad-hoc / Bypasses**: Absolutely NEVER create ad-hoc field variations like `definitionEn`, `translationVi`, `sentenceEn`, `topicVi`, `name` + `viName`, `viMeaning` or custom property suffixes across entities, mappers, or DTOs.
- **Strict Prohibition on Manual Indexing & Raw Property Access on `I18nString`**:
  - ABSOLUTELY NEVER access raw property fields or manual indexing (`obj.en`, `obj.vi`, `obj['en']`, `.[0]`) on `I18nString` objects.
  - ALWAYS resolve text via the generic `i18nText(target, Locale.EN)` or `i18nText(target, locale)` passing `Locale` from the enum.
  - If querying or matching against `I18nString`, ALWAYS use `includesI18n(input, query)`.
- **Mandatory Enums for Fixed Predefined Values**:
  - Any domain concept, setting, configuration, or parameter that has predefined fixed values and can be used as a type MUST strictly and exclusively be defined as a TypeScript `enum` (e.g. `Locale`, `StudySessionMode`, `FlashcardRating`, `PronunciationAccent`, `MaterialTypeEnum`, `RouteEnum`).
  - NEVER use bare string literals (`'en'`, `'vi'`) or string literal unions (`'en' | 'vi'`) when defining core schemas, parameters, or types.
- **Single Universal Data Mapper (`toI18nString`)**: All incoming raw JSONB / object data in frontend mappers MUST be parsed through `toI18nString(raw)` from `services/core/core.mappers.ts`. It returns `{}` for non-object/null inputs without redundant fallback strings.
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

# Strict Part of Speech Enum & Normalization (MANDATORY)
- **PartOfSpeech Enum**: All parts of speech must strictly resolve to standard values from `PartOfSpeech` enum (`noun`, `verb`, `adjective`, `adverb`, `preposition`, `conjunction`, `pronoun`, `interjection`, `phrase`, `idiom`, `numeral`).
- **Universal Normalization Utility (`normalizePartOfSpeech`)**:
  - NEVER write ad-hoc repetitive inline checks or `if-else` chains for part of speech normalization (e.g. `trimmed === 'n' || trimmed === 'noun'`).
  - ALWAYS use `normalizePartOfSpeech(pos)` from `@/shared/utils` for canonical normalization.
  - ALWAYS use `formatPartOfSpeechShort(pos)` from `@/shared/utils` when rendering concise abbreviations (`n.`, `v.`, `adj.`, `adv.`, `prep.`, etc.).

---

# Strict Prohibition on Meaningless Re-assignments, Redundant Fallbacks & Redundant Logic (MANDATORY)
- **Zero Meaningless Re-assignments**:
  - ABSOLUTELY NEVER perform meaningless re-assignments of variables, properties, or fields back to themselves or through identity functions/utils when types already match (e.g. `const x = x`, `const title = toI18nString(command.title)` when `command.title` is already typed as `I18nString`).
  - Pass typed parameters directly to constructors, functions, domain aggregates, and database calls without useless intermediate wrappers.
- **Zero Redundant Fallbacks & Over-defensive Logic**:
  - ABSOLUTELY NEVER add redundant nullish coalescing operators (`?? ''`, `|| ''`, `?? []`, `|| {}`), speculative ternaries, or redundant `if-else` guard blocks when a field, array, or object is already guaranteed by TypeScript types or schema contracts.
  - Eliminate redundant fallback checks and redundant nested `if` statements across services, mappers, handlers, and components. Keep pure logic clean, minimal, and direct.
- **Zero Redundant Code & Dead Logic**:
  - Keep all execution paths concise, direct, and minimal.
  - Strictly eliminate dead code branches, unused helper calls, duplicate assignments, and unnecessary boilerplate wrappers.



