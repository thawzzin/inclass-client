# InClass Client

InClass is the responsive administration frontend for the InClass university attendance system. It supports administrator and teacher workflows for students, teachers, courses, sections, enrollments, daily attendance, history, reports, and role-specific dashboards.

The application is a Next.js App Router project written in strict TypeScript. It integrates with the existing Express API in the sibling `inclass-backend` repository; it does not provide or mock backend behavior at runtime.

## Requirements

- Node.js 24.11 or newer (the shared requirement of the frontend and backend repositories)
- pnpm 10.27 or newer
- A configured and migrated InClass backend

## Local setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Configure and start `../inclass-backend` with `pnpm dev` on port 4000. Its `FRONTEND_URL` must match the frontend origin (`http://localhost:4001` for local development). In development, the frontend forwards `/api/v1/*` to the local backend; deployed Workers use a Service Binding.

3. Start the frontend:

   ```bash
   pnpm dev
   ```

Open [http://localhost:4001](http://localhost:4001). The proxied API health endpoint is [http://localhost:4001/api/v1/health](http://localhost:4001/api/v1/health).

## Authentication and API integration

Authentication uses backend-issued HttpOnly access and refresh cookies. The Axios client sends credentials, obtains the backend CSRF token before writes, performs one coordinated refresh attempt after an expired access session, and never stores tokens in browser storage.

The implemented API contract, authorization rules, response envelopes, and known backend constraints are documented in [docs/API_INTEGRATION.md](docs/API_INTEGRATION.md). Backend routes and validation schemas remain the source of truth.

## Project structure

```text
app/                    Next.js routes, layouts, and providers
src/components/layout/ Shared authenticated application layout
src/features/          Feature UI, API functions, hooks, and domain logic
src/lib/api/           Central Axios client, errors, query keys, and API types
src/lib/query/         TanStack Query client configuration
tests/                 Shared Vitest setup
docs/                  Verified integration documentation
```

Static route layouts remain Server Components where practical. Interactive forms, authentication, and server-state features are isolated in Client Components.

## Quality checks

Run these before opening a pull request or deploying:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

If the local environment prevents Turbopack from opening its internal build port, use the equivalent webpack production build gate:

```bash
pnpm exec next build --webpack
```

Tests use Vitest, React Testing Library, and verified backend-shaped fixtures. They do not require production data.

## Production deployment

- Install dependencies, then run `pnpm build:worker` to create the OpenNext Worker bundle. Run `pnpm preview:worker` for a local Workers preview and `pnpm deploy` to build and publish it. These commands use `wrangler.jsonc` and require Cloudflare authentication for deployment.
- For Cloudflare Git deployment, use `pnpm build:worker` as the build command and `pnpm exec opennextjs-cloudflare deploy` as the deploy command so the build runs once.
- The browser always uses `/api/v1`; remove any obsolete `NEXT_PUBLIC_API_URL` build variable.
- Deploy the backend Worker first. This frontend's `API` Service Binding targets `inclass-backend`; `/api/v1/*` requests are forwarded to it and response cookies stay on the frontend's `workers.dev` origin.
- Set backend `FRONTEND_URL` to the exact frontend `workers.dev` HTTPS origin.
- Apply backend migrations before directing traffic to a new API release.
- Run all frontend and backend quality gates in CI.
- Verify login, refresh, logout, role access, CSRF-protected writes, attendance creation/update, and the duplicate-session conflict flow against a non-production database.

Never use production data for automated or manual acceptance testing.
