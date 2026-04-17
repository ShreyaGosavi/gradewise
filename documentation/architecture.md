# Architecture & Monorepo Structure

## What is a Monorepo?
A monorepo is a single Git repository that contains multiple related projects. It allows shared code, synchronized dependencies, and easier project management.

## Why Turborepo?
Turborepo is a build system on top of npm workspaces that runs tasks like dev, build, and lint across all apps and packages. It uses caching to skip rebuilding unchanged code.

## Repository Structure

```bash
gradewise/
├── apps/
│   ├── backend/          # Express REST API (Node.js + TypeScript)
│   └── web/              # Next.js frontend
│
├── packages/
│   ├── db/               # Prisma schema, migrations, client
│   ├── eslint-config/    # Shared ESLint config
│   └── typescript-config/ # Shared tsconfig
│
├── turbo.json
├── package.json
└── .gitignore

```
## Backend structure
```bash
apps/backend/src/
├── modules/
│   ├── admin/
│   ├── teacher/
│   └── student/
│
├── shared/
│   ├── middleware/
│   ├── utils/
│   ├── validators/
│   ├── controllers/
│   ├── services/
│   └── routes/
│
└── index.ts