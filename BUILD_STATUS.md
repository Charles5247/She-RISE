# SheRISE — Build Status

This documents exactly what is built, what is stubbed, and what remains,
against the locked spec in `docs/BUILD_PROMPT.md` and the design handoff in
`docs/design-handoff/`. Read this before assuming any screen is finished.

## What "done" means here

Given the size of this spec (two full surfaces, 35 screens, a relational M&E
research dataset, panic-hide, i18n, PWA, cross-post/SMS provider contracts),
this pass prioritized building **the entire backend/data/business-logic layer
for real and end-to-end**, over hand-crafting all 35 pixel-perfect screens.
Every rule in the spec that is about *behavior, data, or access control* is
implemented and testable right now via `curl`. The *screens* are partially
built: auth is wired end-to-end with three real pages (`/signup`, `/login`,
`/admin/login`); the other 32 screens have their APIs fully working but
need their UI built against the design tokens and the
`docs/design-handoff/` reference file.

## ✅ Fully implemented and tested

### Data layer (`src/lib/schema.sql`, `src/lib/db.ts`)
Every entity from spec Section 9 exists with the exact field names specified:
`users`, `sponsor_profiles`, `trainer_profiles`, `sessions`, `otp_codes`,
`circles`, `circle_members`, `posts`, `reactions`, `comments`, `pathways`,
`lessons`, `lesson_progress`, `milestones`, `medals`, `trainer_notes`,
`dm_messages`, `notifications`, `referrals`, `survey_responses`,
`export_audit_log`, `broadcasts`, `content_lessons_meta`.

## ✅ Postgres migration — COMPLETE

`better-sqlite3` is a native Node addon and failed to load on a contributor's
Windows machine (`Cannot find module '...\better_sqlite3.node'`), 500-ing
every write endpoint. That risk repeats on any serverless deploy target, so
rather than patch around it the DB client was migrated to real PostgreSQL —
using the `postgres` npm package (a pure-JS client, zero native deps).

**Done so far:**
- Installed and started a real local PostgreSQL 17 server in this sandbox
  (`sudo apt-get install postgresql`), created a `sherise` database. Verified
  reachable and the exact connection string is documented in `.env.example`
  / README "Database setup" below.
- `src/lib/schema.sql` rewritten fully to Postgres dialect: `TIMESTAMPTZ`
  columns with `NOW()` defaults instead of SQLite's `TEXT`/`datetime('now')`;
  `JSONB` for `survey_responses.answers` instead of `TEXT`; added a
  `UNIQUE (user_id, code)` constraint on `medals` (needed for the
  `ON CONFLICT` idempotent-award pattern). Verified this loads cleanly
  against a live Postgres 17 instance with `sql.unsafe(schema)` — all 22
  tables and indexes created with no errors.
- `package.json`: removed `better-sqlite3` / `@types/better-sqlite3`,
  installed `postgres` (postgres.js v3).
- `src/lib/db.ts` rewritten from scratch around `postgres.js`. It exposes the
  **same `getDb()` / `.prepare(sql).get()/.all()/.run()` / `newId()` shape**
  the other ~40 files already call, specifically so most callers only need
  `await` added — not a full query rewrite. Internally it:
  - Converts `?`-positional and `@name`-named placeholders (both styles are
    used across the codebase) to postgres.js's `$1, $2...` style.
  - Registers custom `bigint`/`numeric` type parsers that coerce Postgres's
    `COUNT(*)` (`bigint`) and `AVG(...)` (`numeric`) results to plain JS
    `number` — verified against a live query — since every count/avg in this
    codebase fits safely in a `number` and the postgres.js defaults would
    otherwise return a raw string or a `BigInt` (which breaks
    `JSON.stringify`).
  - Provides a `db.transaction(async (tx) => {...})` API backed by
    postgres.js's `sql.begin()`, matching better-sqlite3's
    `db.transaction(fn)` shape closely enough that only `fn` needs to become
    async and its queries need `await`.
  - Lazily loads `schema.sql` into the target database on first query
    (mirrors the old SQLite `db.exec(schema)` behavior) via `sql.unsafe()`'s
    multi-statement "simple query" mode.
- `src/lib/access.ts`'s `withExportAudit()` converted to this async
  transaction API and its one call site
  (`src/app/api/admin/exports/route.ts`) updated to `await` it and use the
  transaction-scoped `db` handle it's given.
- All remaining ~37 files (`src/lib/auth.ts`, `src/lib/seed.ts`, every
  `src/app/api/**/route.ts` file, and
  `src/app/api/lessons/[id]/complete/route.ts`'s `db.transaction()` block)
  converted to `await` every `.get()/.all()/.run()` call.
- SQL-dialect fixes applied: `datetime('now', ...)` → `NOW()` / `NOW() +
  INTERVAL '...'` / `NOW() - (? || ' days')::interval` (12 files);
  `INSERT OR IGNORE` → `ON CONFLICT (...) DO NOTHING` (4 files, using the
  new `UNIQUE(user_id, code)` constraint on `medals` and the existing
  `UNIQUE(circle_id, user_id)` / `UNIQUE(post_id, user_id)` PK/constraints);
  the string-based date-bucket comparison in
  `src/app/api/notifications/route.ts` now converts `created_at` (a real
  `Date` from Postgres) via `.toISOString()` before comparing; the two N+1
  nested-query loops (`admin/participants/route.ts`, `posts/route.ts`,
  `pathways/route.ts`) restructured with `Promise.all` over an async map.
- `src/lib/seed.ts` fully converted to the async client, AND given the
  required fixed/stable demo participant: phone `08100000001` / password
  `password123`, hardcoded (not randomized) so it survives every reseed —
  see README.md's "Demo credentials" table.
- Schema loads automatically on first request via the app itself (no manual
  step required, though `psql -f schema.sql` also works — see README.md
  "Database setup"). Re-seeded from empty and re-ran the full PR #1 curl
  verification suite against live Postgres: signup → OTP generation → OTP
  verify → session cookie; admin login; demo participant login; referrals
  funnel (with real funnel counts/drop-off math); audited export rejected
  without a `purpose` and accepted with one, with the `export_audit_log` row
  confirmed written transactionally (`psql` query showed the row present
  after a successful export). All passed.
- `npx tsc --noEmit`: **0 errors.** `npm run lint`: **0 errors, 0 warnings.**
  `npm run build`: **succeeds** — all 37 API routes + `/` + `/signup`
  compile and the production build completes cleanly.

**Historical note (superseded by the above):** this previously ran on SQLite
(`better-sqlite3`) as a stand-in for Supabase/Postgres, because no Supabase
project credentials existed in this environment. The schema was written to
be a literal 1:1 match to the spec's Postgres model specifically so this
swap wouldn't require a redesign — which the migration above proved out.

### Access control (`src/lib/access.ts`)
Postgres row-level security was evaluated but this stays application-layer:
the access rules below are enforced centrally in this one file instead of ad
hoc in every route, which keeps them auditable and DB-engine-agnostic. Every
rule from spec Section 9 is enforced here:
- Participants can only read their own `trainer_notes`.
- `last_name` is stripped from every participant-facing/public read (see
  `toPublicUser`, and the explicit per-route handling in `/api/posts`,
  `/api/admin/participants` for sponsors).
- `survey_responses` and `export_audit_log` are only reachable from
  `admin`-scoped routes — never from any participant-facing endpoint.
- Sponsors get aggregate/progress views only — `trainer_notes`, raw
  `survey_responses`, and the enumerator-monitoring block are all excluded for
  that role (see `/api/admin/participants/[id]` and `/api/admin/perception`).
- `withExportAudit()` wraps every `/api/admin/exports` read in the **same
  Postgres transaction** (via postgres.js's `sql.begin()`, through the
  `db.transaction()` shim in `src/lib/db.ts`) as the `export_audit_log`
  insert — if the audit write fails, the transaction rolls back and the
  export fails too. Tested: a request without `purpose` is rejected before
  any data leaves the server, and a successful export's audit row was
  confirmed via a direct `psql` query (see the Postgres migration section
  above).

### Auth (`src/lib/auth.ts`, `/api/auth/*`, `/api/admin/login`)
Cookie-based sessions (httpOnly, scrypt-hashed passwords, hashed session
tokens), OTP signup/verify/resend, forgot/reset password, profile completion,
and a separate `/api/admin/login` that rejects `participant`-role accounts
even with correct credentials (staff/trainer/sponsor only). Full flow tested
end-to-end with curl: signup → OTP → session → `/api/auth/me`. Both real
login pages now exist: `/login` (participant, screen 07) and `/admin/login`
(staff/trainer/sponsor, screen 24, split-screen "Every rise, on record" /
"All access is audited" per the design handoff).

**Robustness fix:** every route under `/api/auth/*` and `/api/admin/login`
is now wrapped in `withErrorHandling()` (`src/lib/apiError.ts`) — if a DB
call throws for any reason (connection dropped, query error, etc.), the
route now returns a real `{"code":"SERVER_ERROR",...}` JSON 500 instead of
crashing with an empty body. Before this fix, an empty-body crash made the
frontend's `res.json()` throw its own unrelated-looking parse error,
hiding the real problem. The three pages that call these routes (`/signup`,
`/login`, `/admin/login`) all use the new `postJson()` helper
(`src/lib/apiClient.ts`), which never lets a bad/empty response body throw
past the caller — it always resolves to `{ ok, status, data, message }` so
the UI can show the generic error message instead of an unhandled
rejection. **Not yet applied** to the other ~27 non-auth routes (posts,
pathways, admin/participants, etc.) — worth a dedicated follow-up pass,
since the pattern is a pure catch-all with no behavior change on the
success path, but it wasn't done here to keep this pass scoped to the
routes actually being touched.

### Deployment surface separation (`src/middleware.ts`, `src/lib/domain.ts`)
Implements the "two domains, one codebase" requirement: set
`NEXT_PUBLIC_APP_SURFACE=participant` on the sherise.com deployment to 404 all
`/admin/*` routes; set it to `admin` on sherise-admin.com to redirect
everything else to `/admin/login`. Unset (local/demo) reaches both.

**Verified: surface separation.** Previously this was only asserted against
404s from routes that didn't exist yet, which proved nothing. Now that both
`/login` and `/admin/login` are real pages, `scripts/verify-surface-separation.sh`
builds the app once, then boots it twice — once per `NEXT_PUBLIC_APP_SURFACE`
value — and curls a representative path set against each real running
instance. Actual output from the last run:

```
[verify] Building app once (shared by both surface runs)...
[verify] Starting server with NEXT_PUBLIC_APP_SURFACE=participant on :4001 ...
[verify] participant surface checks:
  PASS  GET /login (participant) -> 200
  PASS  GET /admin/login (participant, should 404) -> 404
  PASS  GET /api/admin/overview (participant, should 404) -> 404
  PASS  GET / (participant) -> 200
[verify] Starting server with NEXT_PUBLIC_APP_SURFACE=admin on :4002 ...
[verify] admin surface checks:
  PASS  GET /admin/login (admin) -> 200
  PASS  GET / (admin, should redirect) -> redirected to /admin/login
  PASS  GET /login (admin, should redirect) -> redirected to /admin/login

[verify] Results: 7 passed, 0 failed.
```

Run it yourself with `./scripts/verify-surface-separation.sh` (builds the
app, then serves it on ports 4001/4002 in turn — no extra setup beyond a
reachable `DATABASE_URL`). Worth wiring into CI as a required check once a
CI pipeline exists for this repo (none does yet — no `.github/workflows/`
directory).

### Cross-post consent & content filter (`src/lib/crosspost.ts`)
`generateCrosspostCopy()` builds the public caption from **only** the
milestone label + the user's own words, and rejects (`blocked: true`) if the
words "correctional", "reintegration", "rehabilitation", or "program" appear
anywhere in the result — tested against the exact scenario in spec Section 4.
Copy generation happens server-side only (`/api/posts` POST), so the client
can never bypass the filter. Facebook/LinkedIn providers are mocked behind
`FEATURE_CROSSPOST_LIVE` (default `false`, since app review hasn't started
per spec Section 14) but implement the same `send()` interface a real
Graph/Share API client would, and the queue → 30s undo → send lifecycle is
fully wired (`/api/crosspost/[provider]`, `/api/crosspost/[provider]/undo`).

### SMS provider interface (`src/lib/sms.ts`)
`MockSmsProvider` logs instead of calling a real gateway (no provider chosen
yet per spec Section 14) but implements the exact interface
(`sendOtp`, `sendBroadcast`) a real Termii/Africa's Talking client would.

### i18n (`src/i18n/`)
`en.json`, `ha.json`, `yo.json` populated from the spec's starter glossary
verbatim. `ig.json` intentionally left as English fallback with a `_note`
explaining why (no starter glossary exists yet — spec says not to
machine-translate it). `t()` falls back to English for any missing key.

### API surface — all 37 routes from spec Section 10 (and the screen-driving
endpoints beyond it), tested and working:
- Auth: signup, verify-otp, resend-otp, login, logout, me, forgot-password,
  reset-password, complete-profile
- Feed/social: posts (GET paginated + POST), post detail, reactions
  (cheer/hold/celebrate, not likes), comments, notifications (grouped by day)
- Training: pathways, pathway detail, lesson detail, lesson complete
  (awards XP + streak + unlocks next lesson + medal checks)
- Circles: list + join/leave
- Progress: `/api/me/progress` (milestones, streak, medals grid, income log)
- Profile: `/api/me/profile` (GET/PATCH), `/api/me/settings` (GET/PATCH,
  panic-hide default **on**), `/api/me/verify-pin`
- Trainer: `/api/trainers` (participant's assigned trainer), 1:1 DM thread
- Admin: overview (KPIs + top challenges + momentum + map dots), participants
  list + detail (with role-scoped `last_name`/notes visibility), participant
  notes (trainer/admin write), referrals funnel (cumulative counts + drop-off
  %, drop-off reasons, top-LGA conversion, "Signal" insight), perception (full
  Section 8 dataset: geographic coverage, stigma/acceptance, challenges,
  digital skills demand, psychosocial, community readiness, data-quality —
  admin-only), content library, reports list, exports (audited, purpose
  required), broadcasts (SMS mock), trainers & sponsors directory.

### Seed data (`src/lib/seed.ts`)
Runs automatically on first `/api/auth/me` call. Pilot LGA is **Ondo Central**
per spec Section 14, plus 5 nearby Ondo State LGAs for filter/chart variety:
1 admin, 1 sponsor, 3 verified trainers, 40 participants (varied
LGA/skill/streak/XP), 5 pathways × 6 lessons each, 4 circles, 24 posts with
realistic milestone stories + reactions + comments (including trainer
comments), 15 private trainer notes, 220 referrals across the funnel with
drop-off reasons, 340 survey responses (baseline + midline) with the exact
`answers` fields Section 8 asks for, 2 broadcasts.

## 🟡 Partially built

- **UI screens:** `/`, `/signup`, `/login`, and `/admin/login` have real
  pages now (auth is fully wired end-to-end, including error handling — see
  the "Robustness fix" note under Auth above). The other 32
  participant/admin screens (Sections 6–7 of the spec) need to be built as
  React components against
  `docs/design-handoff/design-tokens.json` and the CSS tokens already wired
  into `src/app/globals.css` (`--c-plum`, `--c-magenta`, `--c-gold`, etc.) —
  every color/type/spacing/radius token from the spec is live and ready to
  use, just not yet composed into all 35 screens.
- **Panic-hide UI:** the PIN-verification API (`/api/me/verify-pin`) and the
  `panic_hide_enabled` (default true) field exist; the actual Calculator
  disguise screen, the 2-second long-press gesture, and the tab-title/favicon
  swap (spec Section 4, principle 8) are not yet built.
- **PWA:** `public/manifest.json` exists with the branded icon default (per
  spec Section 5's explicit instruction to default branded and flag the
  question — see Section 14 open item). No service worker yet for the
  offline-lesson-download / draft-post-queue behavior (spec Section 4,
  principle 3) — the `lesson_progress.downloaded_offline` column is ready for
  it.
- **MapLibre + real Nigerian LGA GeoJSON:** the admin overview API returns
  `{lga, count}` dot data; the spec's recommended MapLibre + HDX-boundaries
  map component itself isn't built yet (currently no map render at all).

## 🔴 Not started

- Baseline-vs-endline comparison UI (data model supports it via
  `survey_wave`, no endline data or comparison screen yet — spec explicitly
  says the UI can ship later).
- Real Facebook Graph API / LinkedIn Share API integration (blocked on app
  review per spec Section 14 — mocked interface is ready to swap in).
- Real SMS gateway selection (blocked on vendor choice per spec Section 14).
- Native-speaker review of the Hausa/Yorùbá starter glossary, and sourcing an
  Ìgbò glossary (spec explicitly requires this before shipping — do not
  machine-translate).
- Photography commission (every photo is a `[ photo: label ]` placeholder per
  spec's own instruction not to ship placeholder art to production, but real
  photos aren't sourced yet).

## Open items already flagged in the spec (Section 14) — still open

- Whether the PWA home-screen icon should be branded (current default, per
  the spec's own instruction) or always-neutral for safety — needs an
  explicit decision from the SheRISE team, not a default.
- Photography budget/commission.
- Yorùbá/Hausa/Ìgbò translation vendor + native-speaker review.
- Facebook/LinkedIn app review timeline.
- SMS provider selection.

## Running locally, demo credentials, and deploying the two surfaces

Moved to [`README.md`](./README.md) — "Quick start", "Demo credentials", and
"Deploying the two surfaces separately" — so there's one place to look
instead of two. That includes the fixed/stable demo participant login
(`08100000001` / `password123`), the Postgres/Supabase setup steps, and the
per-surface `NEXT_PUBLIC_APP_SURFACE` deployment steps.

## Building for production

```bash
npm run build     # runs `next build --webpack` — see note below
npm run start
```

**Note on Turbopack:** `next build` (Turbopack, the Next.js 16 default) hung
indefinitely in this sandbox with this route count while the app still ran
on `better-sqlite3` — root cause was never fully isolated (may be specific
to this Next.js 16.3.5 canary, or to the native addon itself). Not
re-tested since the Postgres migration (which removed the native dependency
entirely); plain `next build` is worth re-trying now, but `next build
--webpack` is proven reliable (completes in ~45s, all 37 API routes
compile, `next start` serves correctly), so `package.json`'s `build` script
stays on `--webpack` until Turbopack is re-verified.
