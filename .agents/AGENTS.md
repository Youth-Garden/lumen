# Lumen Project Master Rules

Before making any modifications or writing code in the `frontend` or `backend` directories, you MUST first read the specific guidelines for that section:

- If you are working in `frontend`, read `frontend/AGENTS.md` first.
- If you are working in `backend`, read `backend/AGENTS.md` first.

DO NOT ignore this rule. The specific architectural and syntax rules for frontend and backend are kept strictly inside their respective source directories.

# Agent Communication Style Rule
- Answer straightforwardly, concisely, and directly to the technical problem.
- DO NOT use emotions, flowery language, or exclamations.
- Focus entirely on error analysis, proposing solutions, and reporting execution results.
- Write all code comments in English.

# Agent Quality Assurance Rule
- ALWAYS be meticulous and thorough. DO NOT push code immediately without verifying.
- Before committing and pushing code, MUST run `tsc -b` and `eslint` or the project's build command locally to ensure there are no hidden type errors or linting issues.
- Never guess fixes; verify them thoroughly by running the actual build process locally.

# Strict Prohibition on Workarounds and Aliases Rule
- STRICTLY FORBIDDEN: NEVER use temporary workarounds, re-export aliases, type aliases (e.g. `export const useCreateDeck = useCreateFolder;`, `export type Deck = Folder;`, `export const DECK_REPOSITORY = FOLDER_REPOSITORY;`), or compatibility shims when renaming or refactoring.
- When renaming or removing a concept, you MUST refactor 100% of its usages cleanly across all files, components, types, hooks, and services. Delete the old names and references completely.

# Content & Copywriting Neutrality Rule
- NEVER inject or hardcode specialized domain terms (such as "TOEIC", "IELTS", specific certifications, or specialized test names) into general application copy, section titles, headers, badges, or input placeholders.
- General features, vocabulary, flashcards, decks/folders, dashboard, settings, and UI components must remain completely generic, neutral, and versatile.
- Specialized domain terms may ONLY be used within modules that are strictly dedicated to that specific purpose (e.g., an actual TOEIC mock test module).

- NEVER append redundant count numbers or pill badges (e.g. `(0)`, `[count]`, or `<span ...>{items.length}</span>`) next to section titles, headings, or category labels unless explicitly requested by the user. Section headers must remain clean and minimalist.
