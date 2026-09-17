# Mini Job Queue Dashboard

A small full-stack job queue manager built for the AIRTH React + NestJS intern assignment. It demonstrates API design, React fundamentals, validation, error handling, PostgreSQL persistence, and safe concurrent status updates.

## Live links

- Frontend: `https://web-b1ps1qo0x-avnish6.vercel.app`
- Backend API: `https://airth-assignment-wo75.onrender.comL`


## Tech stack

- Frontend: React, TypeScript, Vite, native Fetch API
- Backend: NestJS, TypeScript, Supabase PostgreSQL (`pg` driver)
- Validation: NestJS `ValidationPipe` and `class-validator`
- Testing: Jest and Vitest/React Testing Library

The frontend intentionally uses React's built-in `useState`, `useEffect`, and `useMemo` rather than an external state-management library. This keeps the solution proportionate to the assignment and makes the React fundamentals easy to review.

## Features

- Create jobs with title and type
- View all jobs, newest first
- Filter jobs by status
- Display counts for pending, running, completed, and failed jobs
- Enforce `pending -> running -> completed/failed`
- Prevent terminal jobs from returning to running
- Delete jobs with confirmation
- Loading, empty, validation, and API error states
- Responsive dashboard
- Swagger API documentation at `/docs`
- Health check at `/health`

## Project structure

```text
apps/
  api/                 NestJS backend
    migrations/        PostgreSQL schema
    scripts/           Migration runner
    src/jobs/           Jobs controller, service, and repository
  web/                 React frontend
```

## Local setup

Requirements: Node.js 20+, npm, and a free Supabase project.

1. Clone the repository and install dependencies:

```bash
npm run install:all
```

2. Create a project at [Supabase](https://supabase.com/dashboard). In the project dashboard, select **Connect**, choose **Session pooler**, and copy its port `5432` connection string. Session mode is recommended for IPv4 development machines and persistent backends.

3. Copy the environment examples:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

4. Put the Supabase connection string in `apps/api/.env`. Replace the password placeholder with your database password:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@YOUR_POOLER_HOST:5432/postgres
DATABASE_SSL=true
FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

Keep this file private. If the password contains reserved URL characters, URL-encode them.

5. Run the included migration and start the backend:

```bash
cd apps/api
npm run db:migrate
npm run start:dev
```

The migration command automatically reads `apps/api/.env`. Alternatively, run `apps/api/migrations/001_create_jobs.sql` directly in the Supabase SQL Editor.

6. In another terminal, start the frontend:

```bash
cd apps/web
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3000`  
Swagger docs: `http://localhost:3000/docs`

Created jobs are visible in **Supabase Dashboard > Table Editor > jobs**. The React application never receives database credentials; only the NestJS backend connects to Supabase.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/jobs` | Create a pending job |
| `GET` | `/jobs` | Get all jobs |
| `PATCH` | `/jobs/:id/status` | Move a job to a valid next status |
| `DELETE` | `/jobs/:id` | Delete a job |
| `GET` | `/health` | Check API availability |

Create request:

```json
{
  "title": "Generate monthly report",
  "type": "report"
}
```

Status update request:

```json
{
  "status": "running",
  "expectedStatus": "pending"
}
```

`expectedStatus` is the status last seen by the client. It is required for safe concurrent updates.

## Concurrency decision

Status rules are enforced by the backend, not only by the React UI. A caller that directly uses the API is therefore subject to the same validation.

The update is performed atomically by PostgreSQL:

```sql
UPDATE jobs
SET status = $nextStatus
WHERE id = $id AND status = $expectedStatus
RETURNING ...;
```

If two tabs both see a pending job and both request `running`, only the first query can match `status = 'pending'`. The second query updates zero rows and receives `409 Conflict`. The frontend then reloads the latest jobs. This is an optimistic concurrency approach: it avoids a long-running lock while preventing stale writes.

## Validation and errors

- Unknown DTO properties are rejected.
- Titles and types must be non-empty strings with maximum lengths.
- Job IDs must be valid UUIDs.
- Invalid transitions return `400 Bad Request`.
- Stale concurrent updates return `409 Conflict`.
- Missing jobs return `404 Not Found`.
- SQL uses parameterized queries.

## Tests

```bash
npm test
npm run build
```

Backend tests cover valid transitions, invalid transitions, stale concurrent updates, and missing jobs. Frontend tests cover loading data and API failure feedback.

## Bonus improvement

The bonus is a `/health` endpoint. Hosting providers can call it to determine whether the API process is available, which improves deployment monitoring and makes failures easier to detect. Swagger documentation was also included to make the API easy to inspect and test.

## Assumptions and trade-offs

- New jobs always start as `pending`; clients cannot choose their initial status.
- `type` is a validated free-text value because the assignment does not define allowed job types.
- Filtering and status counts are client-side because this assignment expects a small dataset.
- The solution uses optimistic concurrency rather than distributed locks because a single PostgreSQL atomic update fully addresses the stated race condition.
- Authentication is outside the assignment scope.
- Supabase is used only as managed PostgreSQL hosting; database access remains behind NestJS.

## With more time

- Add pagination and server-side filters for large datasets.
- Add authentication and role-based authorization.
- Add an audit table recording every status transition.
- Add PostgreSQL integration tests in CI.
- Add structured logs, metrics, and request tracing.
