# Backend Architecture

The Express API uses a feature-first modular monolith. It provides clear ownership and layering
without adding distributed-system complexity to an assignment-sized application.

## Request Flow

```text
HTTP request
  -> API router
  -> feature route
  -> validation middleware
  -> controller
  -> application service
  -> domain policy
  -> repository
  -> Prisma / PostgreSQL
```

Responses follow the reverse path. Repository records are converted to API-safe values by named
mappers before they leave the server.

## Layer Responsibilities

| Layer | Responsibility |
| --- | --- |
| `api` | Composes feature routes under stable public URL prefixes. |
| `controllers` | Reads validated HTTP input, invokes a use case, and writes the HTTP response. |
| `routes` | Declares HTTP methods, paths, validation, and controller bindings. |
| `schemas` | Defines Zod validation for route parameters, queries, and request bodies. |
| `services` | Coordinates business use cases, transactions, audit events, and publications. |
| `policies` | Enforces domain invariants such as allowed contract status transitions. |
| `repositories` | Owns Prisma queries and persistence details. |
| `mappers` | Converts database values such as dates into stable API response values. |
| `types` | Holds feature-specific input and internal contract types. |
| `common` | Contains genuinely reusable middleware, errors, types, and small utilities. |

## Naming Rules

- Feature folders use business nouns: `contracts`, `organisations`, and `contract-events`.
- Files use singular nouns plus their role: `contract.controller.ts`,
  `contract.service.ts`, and `contract.repository.ts`.
- Exported collaborators are singular: `contractService` and `contractRepository`.
- Business rules live in named policies, not generic helper files.
- Cross-feature utilities must be domain-neutral and live under `common`.
- Unit tests sit beside the layer they verify and use the `.test.ts` suffix.
- End-to-end HTTP integration tests live under `apps/server/tests/integration`.

## Module Boundaries

- Controllers do not query Prisma directly.
- Repositories do not depend on Express request or response objects.
- Validation runs at the HTTP boundary and is repeated defensively for uploaded contract payloads
  in the application service.
- Contract workflows are atomic: contract changes and audit events share one database transaction.
- SSE publication happens only after the status transaction succeeds.
- Organisation-scoped repository filters prevent cross-tenant contract access.

## Realtime Boundary

`contract-status-stream.service.ts` owns the in-memory SSE subscribers. Contract application
services publish status-change events through this boundary only after successful finalization or
archiving. For a multi-instance deployment, this implementation can be replaced with Redis pub/sub
or PostgreSQL notifications without changing controllers or public routes.
