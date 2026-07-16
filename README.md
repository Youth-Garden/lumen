# Lumen Platform

The Lumen platform is a comprehensive, scalable educational ecosystem structured to support modern web applications. This repository serves as the root workspace container, seamlessly linking our dedicated Frontend and Backend sub-repositories into a cohesive development environment.

## System Architecture

Lumen adopts a strict separation of concerns, dividing the platform into two distinct workspaces to ensure independent scalability, targeted deployment strategies, and clean domain boundaries.

```mermaid
graph TD
    Client[End Users] --> Web[Next.js Web Application]
    AdminUser[Administrators] --> AdminSPA[Vite Admin SPA]

    subgraph "Frontend Workspace (Turborepo)"
        Web
        AdminSPA
        Web --> Shared[Shared Packages]
        AdminSPA --> Shared
        Shared --> |@lumen/uikit, @lumen/shared-api| APIClient[HTTP Client]
    end

    APIClient --> |REST API over HTTPS| Gateway

    subgraph "Backend Workspace (Modular Monolith)"
        Gateway[NestJS API Gateway]
        Gateway --> IAM[IAM Context]
        Gateway --> Vocabulary[Vocabulary Context]
        Gateway --> Quiz[Quiz Context]
        
        IAM -.-> DB[(PostgreSQL)]
        Vocabulary -.-> DB
        Quiz -.-> DB
    end
```

### Frontend Workspace
The frontend relies on a **Turborepo** monorepo architecture, optimizing build times and promoting code reuse across multiple client applications.
- **Web Application**: A Server-Side Rendered (SSR) application built with Next.js, optimized for search engine visibility and initial load performance.
- **Admin Application**: A Single Page Application (SPA) built with React and Vite, designed for rich, highly interactive administrative workflows.
- **Shared Infrastructure**: Both applications consume shared internal packages (`@lumen/uikit`, `@lumen/hooks`, `@lumen/shared-api`) to maintain UI consistency and enforce DRY principles.

### Backend Workspace
The backend utilizes a **Modular Monolith** architecture built on top of **NestJS**.
- **Domain-Driven Design**: The codebase is segregated into distinct, bounded contexts (e.g., Identity and Access Management, Vocabulary, Quizzes) to maintain high cohesion and low coupling.
- **Data Persistence**: TypeORM is utilized as the primary ORM, interacting with a PostgreSQL relational database.

## Development Environment Setup

This workspace aggregates the repositories. To begin development, navigate to the specific domains.

### Prerequisites
- Node.js (v20 or higher)
- pnpm (v9 or higher, corepack enabled)
- Docker Desktop (for database and infrastructure services)

### Initializing the Backend
The backend requires environment variables and database provisioning prior to startup.

```bash
cd backend
pnpm install
pnpm run db:up         # Assuming a docker-compose script exists for PostgreSQL
pnpm run seed          # Populate the database with initial seed data
pnpm run start:dev     # Starts the NestJS development server on port 3000
```

### Initializing the Frontend
The frontend utilizes Turborepo to concurrently start all necessary development servers.

```bash
cd frontend
pnpm install
pnpm run dev           # Starts both Next.js (port 3001) and Vite (port 3002)
```

## Continuous Integration & Deployment

The deployment pipeline relies on heavily optimized, multi-stage Docker builds executed via GitHub Actions.

- **Frontend Deployment**: Separated into two distinct Docker images (`lumen-web` and `lumen-admin`). The Next.js application utilizes the native `standalone` output for minimal container footprint, while the Vite SPA is served statically via an Nginx alpine image.
- **Backend Deployment**: The NestJS application is pruned to include only production dependencies (`node_modules`) and compiled binaries.
- **Registry**: Images are automatically built, tagged with their respective Git SHAs, and pushed to Docker Hub upon merges to the `main` branch.

## Design System
Lumen strictly adheres to a "Exaggerated Minimalism" design language, tailored for B2B environments. This system emphasizes:
- High contrast and crisp typography.
- Absence of decorative elements (e.g., gradients, heavy drop shadows, emojis).
- Semantic color application (background alternating bands for layout structuring).

Detailed documentation regarding design tokens and component usage can be found in `frontend/documents/design-system.md`.
