# Contract Operations Console

A multi-tenant contract management workspace built with Next.js, Express, PostgreSQL, and Server-Sent Events.

## Features

- Organisation-scoped contract workspaces and team directory
- Local demo access profiles for switching into a seeded workspace
- JSON contract upload with shared Zod validation
- Backend-powered search, filtering, sorting, and pagination
- Draft-only contract editing and deletion
- Controlled contract workflow: `DRAFT -> FINALIZED -> ARCHIVED`
- Persisted audit trail for contract activity
- Live status updates across browser tabs with SSE

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- Backend: Node.js, Express, TypeScript, Prisma, Zod
- Database: PostgreSQL locally and Neon PostgreSQL in production
- Deployment: Vercel for the web app and Railway for the API

## Structure

```text
apps/
  web/              Next.js application
  server/           Express API
packages/
  database/         Prisma schema, migrations, and seed data
  shared/           Shared validation, status constants, and API types
docs/
  openapi.yaml      API reference
  architecture.md   Backend architecture notes
```

## Local Development

Install dependencies and configure local environment variables:

```bash
pnpm install
cp .env.example .env
```

Start PostgreSQL, prepare the database, and launch both applications:

```bash
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- Web app: `http://localhost:3000`
- API health check: `http://localhost:4000/health`

The sign-in screen provides local demo profiles. Select a profile to enter its seeded organisation workspace.

## Environment Variables

```text
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://contract_console:contract_console@localhost:5432/contract_console?schema=public
DIRECT_URL=postgresql://contract_console:contract_console@localhost:5432/contract_console?schema=public
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

For Neon, use the pooled connection string for `DATABASE_URL` and the direct connection string for `DIRECT_URL`. Keep credentials in `.env` only.

## API

OpenAPI documentation: [docs/openapi.yaml](docs/openapi.yaml)

Key endpoints:

```text
GET    /api/organisations
GET    /api/organisations/:organisationId
GET    /api/organisations/:organisationId/members
GET    /api/organisations/:organisationId/contracts
POST   /api/organisations/:organisationId/contracts
GET    /api/organisations/:organisationId/contracts/:contractId
PATCH  /api/organisations/:organisationId/contracts/:contractId
POST   /api/organisations/:organisationId/contracts/:contractId/finalize
POST   /api/organisations/:organisationId/contracts/:contractId/archive
DELETE /api/organisations/:organisationId/contracts/:contractId
GET    /api/organisations/:organisationId/contracts/:contractId/events
GET    /api/organisations/:organisationId/realtime/contracts
```

Contract search supports `status`, `search`, `poDateFrom`, `poDateTo`, `sortBy`, `sortOrder`, `page`, and `pageSize` query parameters.

## Deployment

Deploy `apps/web` to Vercel and `apps/server` to Railway. Configure the following production variables:

```text
# Railway
NODE_ENV=production
CORS_ORIGIN=https://your-vercel-app.vercel.app
DATABASE_URL=your-neon-pooled-connection-string
DIRECT_URL=your-neon-direct-connection-string

# Vercel
NEXT_PUBLIC_API_URL=https://your-railway-service.up.railway.app/api
```

After the API is deployed, apply database migrations and seed data:

```bash
pnpm db:deploy
pnpm db:seed
```
