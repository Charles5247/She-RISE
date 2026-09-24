# SheRISE

A two-sided platform for a nonprofit skill-training and reintegration
program for women returning from correctional and rehabilitation centres in
Nigeria: a participant community + training app, and an admin/M&E dashboard
for staff, trainers, and sponsors.

**Start here:** [`BUILD_STATUS.md`](./BUILD_STATUS.md) — what's built, what's
stubbed, what's not started, and how to run it. The full locked spec is in
[`docs/BUILD_PROMPT.md`](./docs/BUILD_PROMPT.md); the design handoff
(tokens, screen inventory, principles, and a browsable HTML prototype) is in
[`docs/design-handoff/`](./docs/design-handoff/).

## Quick start

```bash
npm install
```

### Database setup (PostgreSQL)

The app requires a Postgres database (local or Supabase). Point it at one via
`DATABASE_URL`:

```bash
# Local Postgres example (adjust user/password/db name to your setup):
createdb sherise
export DATABASE_URL="postgresql://postgres:sherise_dev_pw@localhost:5432/sherise"
```

Or copy `.env.example` to `.env.local` and set `DATABASE_URL` there. The
schema loads automatically on first request (`src/lib/db.ts` runs
`src/lib/schema.sql` against the target database on first query), so no
separate migration command is required — but you can also load it explicitly:

```bash
psql "$DATABASE_URL" -f src/lib/schema.sql
```

For **Supabase**: create a project, copy its connection string from Project
Settings → Database → Connection string → URI, and paste it as `DATABASE_URL`
in a root-level `.env.local` file. The server also accepts `SUPABASE_DB_URL`,
`POSTGRES_URL`, and the public `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
values. Use the Transaction pooler URI (port `6543`) for serverless deploys;
the app automatically disables prepared statements for that URI. You can start
from [`.env.example`](./.env.example). Then either let the app auto-load the
schema on first request or run `psql "$DATABASE_URL" -f src/lib/schema.sql`
yourself.

The application now supports Supabase as the app database and client config,
while keeping the existing server-side cookie/session auth and Postgres query
layer. The browser and server clients are available via `src/lib/supabase.ts`.
Never expose a `service_role` or secret key through a `NEXT_PUBLIC_*` variable.

```bash
npm run dev
```

Open http://localhost:3000. Demo data seeds automatically on first request.
If the browser console reports a signup API 404 after code changes, stop any
older dev server still using port 3000 and restart `npm run dev` from this
checkout. The `/api/auth/signup` route is part of the project. The hydration
warning in the supplied log shows extensions injecting attributes and
wrapping the signup input before React starts; check again in a private
window with extensions disabled. It is not evidence of an application render
mismatch.

## Demo credentials

All seeded on first request against whatever database `DATABASE_URL` points
to. Passwords are for local/demo use only — rotate before any real deploy.

The password shown below (`password123`) is only the **default**, used when
the `SEED_DEMO_PASSWORD` environment variable is unset (which is the case for
a fresh local `npm run dev`). On any shared/staging deployment where
`SEED_DEMO_PASSWORD` has been set to something else, every seeded account's
real password is whatever that variable was set to at seed time — not
necessarily what's printed here.

| Role        | Identifier                                                                      | Password (default) | Sign in at     |
| ----------- | ------------------------------------------------------------------------------- | ------------------- | -------------- |
| Admin       | `admin@sherise.org`                                                             | `password123`       | `/admin/login` |
| Sponsor     | `sponsor@bluesapphire.ng`                                                       | `password123`       | `/admin/login` |
| Trainer     | any seeded trainer email, e.g. `titilayo@sherise.org`                           | `password123`       | `/admin/login` |
| Participant | `08100000001` (fixed/stable — hardcoded in `src/lib/seed.ts`, survives reseeds) | `password123`       | `/login`       |

## Staff accounts and course management

There is no public trainer or sponsor signup. An administrator signs in at
`/admin/login`, opens **Accounts**, and creates trainer or sponsor accounts
with an email or phone number and a temporary password. Share those details
with the account holder securely. Trainers and sponsors use `/admin/login`;
the app sends each role to its own portal (`/trainer/dashboard` or
`/sponsor/dashboard`). Administrators use `/admin/overview` and can manage
accounts under **Accounts**. Courses (pathways) can be added, edited, or
removed from **Content**. Removing a course also removes its lessons and
learner progress.

## Deploying the two surfaces separately

This is one Next.js codebase serving two logical products — the participant
app and the staff/admin dashboard — split at request time by
`src/proxy.ts` reading `NEXT_PUBLIC_APP_SURFACE`:

- Deploy once with `NEXT_PUBLIC_APP_SURFACE=participant` → bind to
  `sherise.com`. Staff portals and `/api/admin/*` routes 404 on this deployment.
- Deploy again with `NEXT_PUBLIC_APP_SURFACE=admin` → bind to
  `sherise-admin.com`. Participant routes redirect to `/admin/login`; admin,
  trainer, and sponsor portals are available on this deployment.
- Leave `NEXT_PUBLIC_APP_SURFACE` unset for local dev to reach both surfaces
  from one running instance.

Both deployments share the same `DATABASE_URL` — the split is purely at the
routing layer, not the data layer. On Vercel, create two projects from the
same Git repository (or deploy the same project twice) and set a different
surface value in each project's Production environment before deploying.

## Deploy to Vercel

1. Push this repository to GitHub, then import it from the Vercel dashboard.
   Keep the Root Directory at `.` and Framework Preset at **Next.js**. The
   project uses `npm run build`; Vercel runs the production server for you.
2. Create a hosted PostgreSQL database (Supabase is supported) and copy its
   connection URI. Use the transaction pooler URI for serverless hosting.
3. In **Settings → Environment Variables**, add `DATABASE_URL` and
   `NEXT_PUBLIC_APP_SURFACE` (`participant` or `admin`). Add
   `SEED_DEMO_PASSWORD` with a unique value if demo accounts should be seeded;
   never use the documented demo password on a public deployment. Keep
   database credentials and any service-role key server-only, without the
   `NEXT_PUBLIC_` prefix.
4. Deploy. Repeat with a second Vercel project for the other surface if you
   want separate participant and admin domains. Set the custom domains under
   **Settings → Domains** and configure DNS as Vercel instructs.
5. Visit the site and check the relevant login page. The database schema is
   created automatically on the first database request. New environments
   should use a dedicated database, since the app seeds demo records into an
   empty database.

## Deploy to Render

1. Create a **Web Service** in Render connected to this repository. Choose
   the Node runtime and set the Root Directory to `.`.
2. Set **Build Command** to `npm install && npm run build` and **Start Command**
   to `npm run start`. Do not deploy this app as a static site; its API routes
   and database access require a running Node server.
3. In **Environment**, add `DATABASE_URL` from a hosted PostgreSQL provider
   and `NEXT_PUBLIC_APP_SURFACE` (`participant` or `admin`). Add a unique
   `SEED_DEMO_PASSWORD` if seeding demo users. Do not put secrets in variables
   prefixed with `NEXT_PUBLIC_`.
4. Create a second Web Service from the same repository for the other surface
   if you want separate participant and admin domains. Set the opposite
   `NEXT_PUBLIC_APP_SURFACE` value on it, then attach custom domains in
   Render's service settings and configure the DNS records Render provides.
5. Wait for the deploy to become live, then open `/login` for participants or
   `/admin/login` for staff. The app creates its schema on the first database
   request; use a dedicated database for each environment.

For either host, use a production PostgreSQL/Supabase database reachable from
the host. Do not use a local database URL, and do not point staging and
production at the same database unless sharing their users and demo seed data
is intentional. See [`.env.example`](./.env.example) for all supported
variables.

## Stack

- Next.js App Router (TypeScript, Tailwind v4) — one codebase for both the
  participant app and the admin dashboard, split by the
  `NEXT_PUBLIC_APP_SURFACE` env var + `src/proxy.ts` for separate
  deployment to `sherise.com` / `sherise-admin.com`.
- PostgreSQL via the `postgres` npm package (postgres.js — pure-JS, zero
  native dependencies) for the data layer. See `src/lib/schema.sql` and
  `BUILD_STATUS.md` for migration history (this replaced an earlier
  `better-sqlite3` prototype that failed to load on Windows).
- Design tokens from the locked "Bold & Empowering" system are wired into
  `src/app/globals.css` as CSS custom properties.

## Production build

`npm run build` runs `next build --webpack` — see the Turbopack note in
`BUILD_STATUS.md`.
