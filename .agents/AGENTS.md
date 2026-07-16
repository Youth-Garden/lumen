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
