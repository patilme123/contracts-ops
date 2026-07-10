# Assignment Coverage

This checklist maps the Full-Stack Engineering Assignment requirements to the implemented
Contract Operations Console.

## Frontend

| Requirement | Status | Implementation |
| --- | --- | --- |
| Select an organisation | Complete | Header organisation switcher scopes all queries and persists the selection locally. |
| Upload contract JSON with validation | Complete | shadcn Dialog and Textarea with shared Zod validation and field-specific feedback. |
| List contracts and statuses | Complete | Responsive API-backed table with DRAFT, FINALIZED, and ARCHIVED badges. |
| Backend search and filters | Complete | Client-name, contract-reference, status, and pagination controls call the REST API. |
| View and edit draft contracts | Complete | Contract detail page supports JSON editing and draft saves. |
| Finalize and archive actions | Complete | Status-specific actions invoke validated workflow endpoints. |
| Audit trail | Complete | Contract detail page renders persisted contract events. |
| Real-time updates | Complete | Organisation-scoped SSE invalidates list, statistics, detail, and event queries. |

## Backend And Database

| Requirement | Status | Implementation |
| --- | --- | --- |
| Validated JSON uploads | Complete | Shared Zod schema validates required fields before PostgreSQL persistence. |
| Organisation scoping | Complete | Every contract and event query includes the organisation identifier. |
| Status, client, and ID search | Complete | Prisma filters support status, partial case-insensitive client name, UUID, and contract number. |
| Pagination | Complete | Validated page and page-size parameters return pagination metadata. |
| Draft-only update and delete | Complete | Domain policies reject invalid operations with HTTP 409. |
| DRAFT to FINALIZED to ARCHIVED | Complete | Transactional status actions enforce the workflow and record events. |
| Audit events | Complete | Create, update, finalize, archive, and delete operations record contract events. |
| JSONB payload | Complete | Prisma maps `fieldData` to PostgreSQL `field_data` JSONB. |
| Seed data | Complete | Idempotent seed provides 2 organisations and 5 contracts across all statuses. |
| Real-time status changes | Complete | SSE sends connected heartbeats and contract status change events. |

## Submission And Bonus

| Item | Status |
| --- | --- |
| Setup, environment, and local development documentation | Complete |
| OpenAPI documentation | Complete |
| API and business workflow tests | Complete - 18 automated tests |
| Docker Compose for local PostgreSQL | Complete |
| Railway and Vercel deployment configuration | Complete |
| PDF attachment upload | Not implemented - optional bonus only |
| Cloud deployment and deployed URLs | Pending final deployment |
| GitHub repository URL | Pending repository publication |
