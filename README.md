# Lumen Platform

![Lumen](https://via.placeholder.com/1200x300?text=Lumen+Platform)

Welcome to the **Lumen** project workspace. Lumen is a comprehensive, scalable platform divided into robust frontend and backend architectures designed to handle modern web applications efficiently.

This repository serves as the **Root Workspace (Monorepo Container)** that links our dedicated Frontend and Backend repositories.

## 🏗 System Architecture

The Lumen platform is architected with strict separation of concerns, utilizing dedicated repositories for frontend applications and backend services.

### 1. Frontend Workspace (`/frontend`)
The frontend is structured as a **Turborepo** monorepo containing multiple applications and shared packages.
- **Web App**: A server-rendered application built with **Next.js** for maximum performance and SEO.
- **Admin App**: A Single Page Application (SPA) built with **Vite** and **React** for internal management.
- **Shared Packages**: Custom UI Kit, utility functions, hooks, and API clients shared across the applications.
- **Deployment**: Configured with Docker multi-stage builds and automated CI/CD via GitHub Actions.

### 2. Backend Workspace (`/backend`)
The backend is a **Modular Monolith** built with **NestJS**.
- **Architecture**: Domain-Driven Design (DDD) inspired modular structure.
- **Core Technologies**: TypeScript, NestJS, TypeORM.
- **Infrastructure**: Configured for Docker-based deployment with streamlined CI/CD pipelines via GitHub Actions.

## 🚀 Getting Started

Since this root repository uses Git submodules (or separate nested repositories), you need to navigate to the respective directories to start the development servers.

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (v9+)
- Docker & Docker Compose (Optional, for running infrastructure)

### Running the Backend

```bash
cd backend
pnpm install
pnpm run start:dev
```
*The backend will typically be available on `http://localhost:3000` (or as configured in your `.env`).*

### Running the Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```
*Turborepo will concurrently start both the `web` and `admin` development servers.*

## 📦 CI/CD & Docker

Both the frontend and backend are fully containerized.
- **GitHub Actions** workflows are set up in their respective `.github/workflows/deploy.yml` files.
- Pushing to the `main` branch automatically builds Docker images (`lumen-web`, `lumen-admin`, `lumen-backend`) and pushes them to Docker Hub.

## 🎨 Design System
Lumen adheres to a strict "Exaggerated Minimalism" design system tailored for B2B usage. It emphasizes high contrast, crisp typography, and avoids unnecessary decorative elements (like heavy gradients or excessive blurs). Documentation for the design system can be found in `frontend/documents/design-system.md`.

---
*Built with ❤️ for scalable and maintainable web development.*
