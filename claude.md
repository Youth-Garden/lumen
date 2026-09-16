# Lumen Project - Claude Code Configuration

## Before Coding

ALWAYS read the appropriate skill in `.agents/skills/` before making modifications or writing code:

- **Feature planning**: `.agents/skills/ba/SKILL.md`
- **Backend**: `.agents/skills/backend/SKILL.md`
- **Frontend**: `.agents/skills/frontend/SKILL.md`

## Project Rules (From .agents/AGENTS.md)

### Agent Communication
- Answer straightforwardly, concisely, and directly
- No emotions, flowery language, or exclamations
- Focus on error analysis, solutions, and execution results
- All code comments in English

### Code Quality (MANDATORY)
- Run `tsc -b` and `eslint` or build command before committing
- Never push code without verifying
- Never guess fixes - verify thoroughly

### Zero Anti-Patterns (MANDATORY)
- No service layer leaking into UI
- No duplicate i18n dictionaries
- No compatibility aliases/workarounds
- No coupled/ping-pong state hooks
- No type bypasses (`any`, `as unknown as T`)

### UI/Aesthetics (Frontend Mandatory)
- No hard borders / minimal border usage
- No card clutter / box-in-box anti-pattern
- No manual button re-styling (use variants)
- Use `@lumen/uikit/components` and `@lumen/uikit/icons`

### Content Neutrality
- No hardcoded specialized domain terms (TOEIC, IELTS)
- No redundant count badges in section headers

### Testing
- Never open browser for testing
- Use `tsc --noEmit`, `eslint`, terminal tests

## Key Directories

- `frontend/` - Next.js web app with React, Tailwind CSS, shadcn/ui
- `backend/` - NestJS Fastify server with DDD/CQRS, TypeORM, PostgreSQL
- `packages/uikit/` - Shared UI component library
