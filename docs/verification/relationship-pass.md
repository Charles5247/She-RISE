# Trainer and sponsor relationship pass

Implementation is in the working tree. Production deployment was not performed. Browser visual QA could not run: the browser inventory was empty, Chrome creation timed out, and the in-app browser reported unavailable.

## Task 1: database

Files: src/lib/schema.sql, scripts/relationships.sql, scripts/verify-relationships.mjs.

Added trainer_assignments and sponsor_sponsorships with active-pair partial unique indexes, timestamps, user foreign keys, FK indexes, and RLS. Assignment removal sets unassigned_at; sponsorship removal sets ended_at. Reassignment creates a new row. Existing profile counts remain untouched and have a deprecation comment. No assignments were inferred from historical notes or flat sponsor counts.

User references use ON DELETE SET NULL so existing account DELETE continues to work without deleting relationship history. The server requires actual trainer/sponsor/participant roles when creating links. RLS is enabled with no browser policies, and anon/authenticated grants are revoked because the app uses custom server-side sessions rather than Supabase Auth identities.

Migration ran cleanly twice against the configured real Supabase host aws-1-eu-west-1.pooler.supabase.com at 2026-09-24T18:01:55.568Z. The second run verified repeatability. The following structure was reconstructed from actual information_schema, pg_constraint, and pg_indexes results after migration; the raw results are in relationships-schema.json.

```sql
CREATE TABLE public.trainer_assignments (
  id text NOT NULL,
  trainer_id text,
  participant_id text,
  assigned_by text,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  unassigned_at timestamp with time zone,
  CONSTRAINT trainer_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT trainer_assignments_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT trainer_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT trainer_assignments_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE UNIQUE INDEX trainer_assignments_active_pair ON public.trainer_assignments USING btree (trainer_id, participant_id) WHERE (unassigned_at IS NULL);
CREATE INDEX trainer_assignments_admin ON public.trainer_assignments USING btree (assigned_by);
CREATE INDEX trainer_assignments_participant ON public.trainer_assignments USING btree (participant_id);
CREATE INDEX trainer_assignments_trainer ON public.trainer_assignments USING btree (trainer_id);
ALTER TABLE public.trainer_assignments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.sponsor_sponsorships (
  id text NOT NULL,
  sponsor_id text,
  participant_id text,
  sponsored_since timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  CONSTRAINT sponsor_sponsorships_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT sponsor_sponsorships_pkey PRIMARY KEY (id),
  CONSTRAINT sponsor_sponsorships_sponsor_id_fkey FOREIGN KEY (sponsor_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE UNIQUE INDEX sponsor_sponsorships_active_pair ON public.sponsor_sponsorships USING btree (sponsor_id, participant_id) WHERE (ended_at IS NULL);
CREATE INDEX sponsor_sponsorships_participant ON public.sponsor_sponsorships USING btree (participant_id);
CREATE INDEX sponsor_sponsorships_sponsor ON public.sponsor_sponsorships USING btree (sponsor_id);
ALTER TABLE public.sponsor_sponsorships ENABLE ROW LEVEL SECURITY;

```

## Task 2: admin management

Files:
- src/app/admin/trainers/page.tsx
- src/app/api/admin/trainers/route.ts
- src/app/api/admin/trainers/[trainerId]/assignments/route.ts
- src/app/api/admin/sponsors/[sponsorId]/sponsorships/route.ts
- src/lib/relationships.ts

Create trainer/sponsor forms preset the role and use existing POST /api/admin/users. Edit uses existing PATCH with id; removal uses existing DELETE with id and a UI confirmation. The directory uses actual active counts. Both relationship endpoints support GET for the roster, POST with participantId, and DELETE with participantId in the query string. Mutations are admin-only; invalid roles/IDs are rejected, repeated adds are idempotent, and concurrent duplicate adds are handled by partial uniqueness plus ON CONFLICT. The UI includes labelled fields, loading/error/retry states, and disabled mutation controls.

## Tasks 3-6: screen-by-screen handoff mapping

The checked-in handoff is docs/design-handoff. Its 35-screen inventory contains no dedicated trainer/dashboard or sponsor/dashboard artboard. These portals extend its existing design language; exact matching to a separate, unavailable portal artboard is not claimed. The login reference does include a featured staff CTA; the explicit request to reduce its prominence takes precedence.

| Screen | Handoff reference | Changes |
| --- | --- | --- |
| /trainer/dashboard (Tasks 3, 5) | #/admin-participant, #/admin-overview, #/admin-trainers; design tokens/principles | Active assigned participants, first name/LGA/skill, five latest own notes per participant, note form and conversation links. Shared plum/gold header, display typography, token-based cards and responsive layout. |
| /sponsor/dashboard (Tasks 4, 5) | #/admin-overview, #/admin-participants, #/admin-trainers; design tokens/principles | Sponsor-specific roster, sponsorship dates and completed lesson counts. Totals derive from that roster. Shared portal/card/identity components and existing PButton/Avatar. No trainer notes or private account fields. |
| /trainer-chat/[trainerId] (Task 3 integration) | #/trainer-chat | Trainer selects a participant via the roster link; GET/POST enforce matching trainer identity and an active assignment. Chat displays partner name and supports both directions. Fixed surface routing so the route works on staff and participant deployments. |
| /login (Task 6) | #/login | Replaced the icon/card staff CTA with a small text link immediately below the account-creation line. |
| /admin/trainers (Task 2) | #/admin-trainers | Responsive trainer/sponsor sections now expose account CRUD and active participant management using shared cards/buttons. |

Task 3 files: src/app/trainer/dashboard/page.tsx, src/app/api/trainer/dashboard/route.ts, src/app/api/admin/participants/[id]/notes/route.ts, src/app/trainer-chat/[trainerId]/page.tsx, src/app/api/trainer/chat/[trainerId]/route.ts, src/proxy.ts.

Task 4 files: src/app/sponsor/dashboard/page.tsx, src/app/api/sponsor/dashboard/route.ts.

Task 5 shared files: src/components/StaffPortal.tsx, src/app/globals.css, both dashboard pages above. Existing PButton and Avatar reused.

Task 6 files: src/app/login/page.tsx, src/app/globals.css.

## Verification

- Production build: next build --webpack passed, including all 67 generated pages.
- Final TypeScript and targeted ESLint checks passed after the error-handling refinements.
- Real database migration ran twice successfully; structure and RLS captured in relationships-schema.json.
- scripts/test-relationships.mjs runs HTTP requests against the local app using real Supabase fixtures, then cleans up only its own users, sessions, relationships, messages, notes, course and lesson.
- See relationships-tests.json for the latest passing API test record.
- Browser-rendered visual and interactive UI inspection remains unverified because no browser is available. Responsive CSS and semantic controls were reviewed in source, and routes passed production compilation.

Course CRUD and generic user-management implementation files were not modified.
