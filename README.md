# Contract Operations Console

A full-stack contract operations console for the 2026 full-stack engineering assignment.

The application is structured as a professional TypeScript monorepo with a Next.js frontend, an Express backend, shared validation/types, Prisma, and PostgreSQL.

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-style components, TanStack Query
- Backend: Node.js, Express, TypeScript, Prisma, Zod
- Database: PostgreSQL locally, Neon PostgreSQL in production
- Real-time: Server-Sent Events for contract status broadcasts
- Deployment target: Vercel for `apps/web`, Railway for `apps/server`
- Alternative backend deployment: AWS EC2 with PM2 and Nginx

## Repository Structure

```text
apps/
  web/       Next.js application
  server/    Express API server
packages/
  database/  Prisma schema, Prisma client export, and database seed
  shared/    Shared schemas, status constants, and API types
```

## Local Setup

Install dependencies:

```bash
pnpm install
```

Copy environment variables:

```bash
cp .env.example .env
```

Start local PostgreSQL:

```bash
docker compose up -d
```

Generate Prisma client and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

Seed local data:

```bash
pnpm db:seed
```

Start both apps:

```bash
pnpm dev
```

Frontend runs at:

```text
http://localhost:3000
```

Backend health check:

```text
http://localhost:4000/health
```

## Environment Variables

```text
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://contract_console:contract_console@localhost:5432/contract_console?schema=public
DIRECT_URL=postgresql://contract_console:contract_console@localhost:5432/contract_console?schema=public
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

For Neon PostgreSQL, use the pooled Neon connection string for `DATABASE_URL` and the direct connection string for `DIRECT_URL`. Keep real Neon credentials in `.env`; do not commit them.

## API Shape

Planned endpoints:

```text
GET    /api/organisations
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

Search parameters:

```text
status=DRAFT|FINALIZED|ARCHIVED
clientName=partial text
contractId=uuid or contract number
page=1
pageSize=10
```

## Contract JSON

```json
{
  "client_name": "Apex Manufacturing",
  "po_ref_no": "PO-2026-1001",
  "po_date": "2026-01-15",
  "payment_terms": "Net 30",
  "delivery_terms": "FOB Mumbai",
  "items": [
    {
      "description": "Industrial packing materials",
      "quantity": 1200,
      "quantity_unit": "units",
      "unit_price": 4.5,
      "pricing_unit": "unit",
      "total": 5400
    }
  ]
}
```

## Data Model

The Prisma schema, seed script, and exported Prisma client live in `packages/database`.

Core tables:

- `organisations`
- `contracts`
- `contract_events`

Contracts store the uploaded payload in `field_data` as JSONB while duplicating searchable fields such as client name, PO reference, and PO date into normal columns.

## Real-Time Design

The server exposes an SSE stream at:

```text
GET /api/organisations/:organisationId/realtime/contracts
```

SSE is appropriate for this assignment because status updates are one-way server-to-browser events. If the backend later scales to multiple instances, the in-memory broadcaster can be replaced with Redis pub/sub or PostgreSQL notifications.

## Deployment Notes

Primary path:

- Deploy `apps/web` to Vercel.
- Deploy `apps/server` to Railway.
- Use Neon PostgreSQL for production.

Railway variables:

```text
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://your-vercel-app.vercel.app
DATABASE_URL=your-neon-pooled-connection-string
DIRECT_URL=your-neon-direct-connection-string
```

Vercel variables:

```text
NEXT_PUBLIC_API_URL=https://your-railway-server.up.railway.app/api
```

AWS EC2 alternative:

- Install Node.js LTS and pnpm.
- Build `apps/server`.
- Run the server with PM2.
- Put Nginx and HTTPS in front of Express.
- Keep Neon as the database.

## Current Milestone

This first commit sets up the monorepo foundation, UI shell, API shell, shared schemas, Prisma schema, seed scaffold, and documentation.

The next milestone should implement full organisation-scoped CRUD, workflow transitions, audit writes, frontend data loading, and backend tests.
