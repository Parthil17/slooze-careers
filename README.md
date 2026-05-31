# 🍔 Slooze — Food Ordering Platform

> Production-ready full-stack food ordering application with **JWT auth**, **RBAC**, and **country-based data isolation**.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Shadcn-style UI, React Query, Axios |
| Backend | NestJS, Prisma, PostgreSQL, JWT, Passport |
| DevOps | Docker, Docker Compose |
| Testing | Jest, React Testing Library, Supertest |

---

## 📁 Project Structure

```
apps/
  backend/    # NestJS API
  frontend/   # Next.js UI
packages/
  shared/     # Shared enums & permission matrix
docs/         # Architecture, ER diagram, API docs
postman/      # Postman collection
```

---

## ✅ Prerequisites

- Node.js 20+
- Docker & Docker Compose *(recommended)*
- PostgreSQL 16 *(only if running DB locally without Docker)*

---

## 📦 Installation

```bash
# From repository root
npm install
npm run build -w @slooze/shared
```

---

## 🔐 Environment Variables

### Backend — `apps/backend/.env`

```env
DATABASE_URL=postgresql://slooze:slooze_secret@localhost:5432/food_ordering?schema=public
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=24h
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### Frontend — `apps/frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🗄️ Database Setup

### Option A — SQLite *(No Docker, No PostgreSQL — Windows Friendly)*

Use this if you see **`P1001: Can't reach database server`** or **`docker is not recognized`**:

```powershell
cd apps/backend
npm run db:setup:sqlite
```

This creates `prisma/dev.db`, copies `.env.sqlite` → `.env`, and runs the seed. Then start the API:

```powershell
npm run dev
```

---

### Option B — Docker + PostgreSQL

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and on your PATH.

```bash
docker compose up -d postgres
cd apps/backend
npx prisma migrate deploy
npx prisma db seed
```

---

### Option C — Local PostgreSQL

Install from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/), create the `food_ordering` database, then:

```bash
cd apps/backend
npx prisma migrate deploy
npx prisma db seed
```

---

### Migrate & Seed *(PostgreSQL only)*

```bash
# From apps/backend
npx prisma migrate deploy
npx prisma db seed

# Or from root
npm run db:migrate
npm run db:seed
```

---

## 🌱 Seed Data

**Default password for all seeded users:** `Password123!`

| Name | Email | Role | Country |
|------|-------|------|---------|
| Nick Fury | nick.fury@slooze.com | ADMIN | GLOBAL |
| Captain Marvel | captain.marvel@slooze.com | MANAGER | INDIA |
| Captain America | captain.america@slooze.com | MANAGER | AMERICA |
| Thanos | thanos@slooze.com | MEMBER | INDIA |
| Thor | thor@slooze.com | MEMBER | INDIA |
| Travis | travis@slooze.com | MEMBER | AMERICA |

---

## 🚀 Running the App

### Backend only

```bash
npm run dev -w @slooze/backend
# API  → http://localhost:3001
# Docs → http://localhost:3001/api/docs
```

### Frontend only

```bash
npm run dev -w @slooze/frontend
# UI → http://localhost:3000
```

### Both together

```bash
npm run dev
```

---

## 🐳 Docker

```bash
# Full stack (Postgres + API + UI)
docker compose up --build

# Postgres only
docker compose up -d postgres
```

---

## 🧪 Tests

```bash
# Backend unit tests
npm run test -w @slooze/backend

# Backend e2e (requires DB seeded)
npm run test:e2e -w @slooze/backend

# Frontend unit tests
npm run test -w @slooze/frontend

# All tests
npm run test
```

---

## ✨ Key Features

- **RBAC** — Permission guard returns HTTP 403 for unauthorized actions
- **Country Isolation** — Row-level filtering in Prisma queries + assert guards
- **UI Gates** — Buttons hidden when role lacks permission
- **Order Flow** — `Draft → Checkout → Pay → Paid` (or `Cancel`)

---

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [ER Diagram](./docs/ER_DIAGRAM.md)
- [API Reference](./docs/API.md)
- [Postman Collection](./postman/food-ordering-api.json)

---

## 🛟 Troubleshooting

| Error | Fix |
|-------|-----|
| `docker is not recognized` | Install Docker Desktop **or** use `npm run db:setup:sqlite` in `apps/backend` |
| `P1001: Can't reach database server` | PostgreSQL not running — use **Option A (SQLite)** above |
| Seed fails after migrate | Run migrate/seed only after the database is up |
| Login shows "Invalid email or password" | Backend not running — open a new terminal: `cd apps/backend && npm run dev` and wait for `API running on http://localhost:3001` |
| `Cannot find module dist/main` | Run `cd apps/backend && npm run build` then `npm run dev` |

---

