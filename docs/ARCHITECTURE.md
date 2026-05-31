# Architecture Document — Slooze Food Ordering Platform

## Overview

Monorepo full-stack food ordering system with **JWT authentication**, **RBAC**, and **country-based row-level data isolation**. Frontend and backend are decoupled; shared types and permission matrix live in `packages/shared`.

```
slooze-careers/
├── apps/
│   ├── backend/     # NestJS API
│   └── frontend/    # Next.js 15 App Router
├── packages/
│   └── shared/      # Roles, permissions, enums
├── docs/
├── postman/
└── docker-compose.yml
```

## Architectural Decisions

### 1. Monorepo with shared package

**Why:** Single source of truth for `Role`, `Country`, `Permission`, and `PERMISSION_MATRIX`. Prevents frontend/backend permission drift.

### 2. Layered backend (Clean Architecture influence)

| Layer | Responsibility |
|-------|----------------|
| Controllers | HTTP, DTO validation, guard composition |
| Services | Business rules, orchestration |
| PermissionsModule | RBAC matrix + country filters |
| CountryAccessService | Row-level assertions and Prisma `where` builders |
| Prisma | Persistence |

**Why:** Guards stay thin; business rules (order state transitions, country checks) stay in services.

### 3. Dual authorization model

1. **RBAC (PermissionsGuard)** — Can this *role* perform this *action*? Returns **403** if denied.
2. **Country isolation (CountryAccessService)** — Can this *user* access this *row*? Applied in queries and `assert*` methods.

**Why:** Role answers capability; country answers data scope. Admin (`GLOBAL`) bypasses country filters.

### 4. JWT + Passport

Stateless auth suitable for SPA/Next.js. `JwtStrategy` re-validates user on each request.

### 5. Order lifecycle

```
DRAFT → (checkout) → PLACED → (pay) → PAID
                ↘ (cancel) → CANCELLED
```

Members build carts (DRAFT); only Manager/Admin can checkout, pay, cancel.

### 6. Frontend permission gates

`PermissionGate` + `useAuth().can()` hide UI actions that would 403 on API — defense in depth.

## Security

- Passwords: bcrypt (10 rounds)
- DTO validation: `class-validator` + global `ValidationPipe`
- JWT secret via environment variable
- No sensitive card data stored (masked numbers only)

## Scalability Notes

- Stateless API → horizontal scaling behind load balancer
- Country filter pushed to DB (`where: { country }`) — index-friendly
- Shared package versioned with monorepo

## API Surface

See [API.md](./API.md) and Swagger at `/api/docs` when backend is running.
