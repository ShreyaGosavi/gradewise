# Tech Stack

## Monorepo Tooling
- **Turborepo** — task runner and build orchestration; handles parallel execution and caching across all apps and packages
- **npm workspaces** — dependency linking between apps and packages in the monorepo

## Backend (`apps/backend`)
- **Node.js** with **TypeScript**
- **Express.js** — HTTP server and routing
- **Prisma ORM** — type-safe database access and schema management
- **PostgreSQL** (hosted on Neon DB) — relational database
- **JWT (jsonwebtoken)** — authentication tokens for admin, teacher, and student roles
- **bcryptjs** — password hashing
- **Zod** — request validation and enum enforcement
- **Resend** — transactional email (welcome emails with auto-generated passwords)
- **Multer** — multipart file uploads (CSV bulk student import)
- **csv-parse** — CSV parsing for bulk student upload

## Frontend (`apps/web`)
- **Next.js 14+** with **TypeScript**
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — pre-built accessible UI components
- **Axios** — HTTP client for API calls
- **Zustand** — client-side state management (auth tokens, user info)
- **React Hook Form + Zod** — form handling and validation
- **next-themes** — dark mode support

## Database
- **Neon DB** — serverless PostgreSQL hosting
- Schema managed entirely through Prisma migrations

## Shared Packages (`packages/`)
- **@repo/eslint-config** — shared ESLint rules across all apps
- **@repo/typescript-config** — shared tsconfig base

## Dev Tools
- **ESLint** — linting
- **Prettier** — code formatting
- **TypeScript** — static type checking across the entire monorepo
- **tsx** — TypeScript execution for the backend dev server
- **WebStorm HTTP Client** — API testing via `.http` files