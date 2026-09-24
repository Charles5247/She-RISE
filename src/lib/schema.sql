-- SheRISE data model — implements Section 9 of the build spec exactly.
-- Engine: PostgreSQL (via the `postgres` npm package — a pure-JS client with
-- no native binary, so it runs identically on any contributor machine and
-- any serverless deploy target). Point DATABASE_URL at a local Postgres for
-- development or at a hosted Supabase/Postgres instance for staging/prod —
-- see README.md "Database setup" for exact commands. Table and field names
-- match the spec's Section 9 model 1:1.

-- Timestamp columns use TIMESTAMPTZ (not TEXT) — this is the idiomatic
-- Postgres type and lets us use NOW()/INTERVAL date math directly in
-- queries instead of SQLite's datetime() string functions.

CREATE TABLE IF NOT EXISTS users (
  id                    TEXT PRIMARY KEY,
  role                  TEXT NOT NULL CHECK (role IN ('participant','trainer','admin','sponsor')),
  first_name            TEXT NOT NULL,             -- public
  last_name             TEXT,                       -- PRIVATE — never selectable from participant/public queries
  phone                 TEXT UNIQUE,
  email                 TEXT UNIQUE,
  password_hash         TEXT NOT NULL,
  pin_hash              TEXT,                        -- panic-hide unlock PIN
  language              TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en','ha','yo','ig')),
  lga                   TEXT,
  avatar_url            TEXT,
  bio                   TEXT,
  is_verified_trainer   INTEGER NOT NULL DEFAULT 0,
  panic_hide_enabled    INTEGER NOT NULL DEFAULT 1,
  wifi_only_downloads   INTEGER NOT NULL DEFAULT 1,
  crosspost_fb_connected  INTEGER NOT NULL DEFAULT 0,
  crosspost_li_connected  INTEGER NOT NULL DEFAULT 0,
  xp_total              INTEGER NOT NULL DEFAULT 0,
  streak_count          INTEGER NOT NULL DEFAULT 0,
  last_lesson_date      TEXT,                        -- 'YYYY-MM-DD' string, compared by exact equality only
  skill_category        TEXT,                        -- chosen at onboarding (pick-path screen)
  age                   INTEGER,
  onboarding_complete   INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsor_profiles (
  user_id               TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  -- Legacy manual count; eventually derive from active sponsor_sponsorships COUNT.
  women_sponsored_count INTEGER NOT NULL DEFAULT 0,
  sponsor_since_year    INTEGER
);

CREATE TABLE IF NOT EXISTS trainer_profiles (
  user_id               TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  rating                REAL NOT NULL DEFAULT 4.5,
  specialty             TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash            TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at            TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id                    TEXT PRIMARY KEY,
  destination           TEXT NOT NULL,   -- phone or email
  code                  TEXT NOT NULL,
  purpose               TEXT NOT NULL DEFAULT 'signup',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at            TIMESTAMPTZ NOT NULL,
  consumed              INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS circles (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  description           TEXT,
  lga                   TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circle_members (
  circle_id             TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (circle_id, user_id)
);

CREATE TABLE IF NOT EXISTS posts (
  id                    TEXT PRIMARY KEY,
  author_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body                  TEXT NOT NULL,
  photo_url             TEXT,
  milestone_type        TEXT NOT NULL DEFAULT 'none' CHECK (milestone_type IN ('first_income','week_complete','new_skill','none')),
  crosspost_fb          INTEGER NOT NULL DEFAULT 0,
  crosspost_linkedin    INTEGER NOT NULL DEFAULT 0,
  crosspost_copy        TEXT,
  crosspost_fb_status   TEXT NOT NULL DEFAULT 'idle' CHECK (crosspost_fb_status IN ('idle','queued','sent','undone','failed')),
  crosspost_li_status   TEXT NOT NULL DEFAULT 'idle' CHECK (crosspost_li_status IN ('idle','queued','sent','undone','failed')),
  circle_id             TEXT REFERENCES circles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reactions (
  id                    TEXT PRIMARY KEY,
  post_id               TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind                  TEXT NOT NULL CHECK (kind IN ('cheer','hold','celebrate')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id                    TEXT PRIMARY KEY,
  post_id               TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body                  TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pathways (
  id                    TEXT PRIMARY KEY,
  title                 TEXT NOT NULL,
  skill_category        TEXT NOT NULL,
  description           TEXT,
  order_index           INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lessons (
  id                    TEXT PRIMARY KEY,
  pathway_id            TEXT NOT NULL REFERENCES pathways(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  video_url_480p        TEXT,
  video_url_hd          TEXT,
  xp_value              INTEGER NOT NULL DEFAULT 10,
  order_index           INTEGER NOT NULL DEFAULT 0,
  duration_seconds      INTEGER NOT NULL DEFAULT 300,
  steps_json            TEXT NOT NULL DEFAULT '[]'  -- JSON array of step reflections
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id             TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status                TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked','current','done')),
  completed_at          TIMESTAMPTZ,
  downloaded_offline    INTEGER NOT NULL DEFAULT 0,
  accuracy              INTEGER,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS milestones (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id               TEXT REFERENCES posts(id) ON DELETE SET NULL,
  type                  TEXT NOT NULL CHECK (type IN ('first_income','week_complete','new_skill')),
  amount                REAL,
  verifier_id           TEXT REFERENCES users(id) ON DELETE SET NULL,
  story                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medals (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code                  TEXT NOT NULL,
  label                 TEXT NOT NULL,
  earned_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, code)
);

CREATE TABLE IF NOT EXISTS trainer_notes (
  id                    TEXT PRIMARY KEY,
  trainer_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body                  TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dm_messages (
  id                    TEXT PRIMARY KEY,
  trainer_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body                  TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind                  TEXT NOT NULL CHECK (kind IN ('reaction','comment','milestone_verified','broadcast','trainer_message','circle')),
  actor_id              TEXT REFERENCES users(id) ON DELETE SET NULL,
  post_id               TEXT REFERENCES posts(id) ON DELETE CASCADE,
  body                  TEXT NOT NULL,
  read_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
  id                    TEXT PRIMARY KEY,
  participant_id        TEXT REFERENCES users(id) ON DELETE SET NULL,
  source                TEXT NOT NULL,
  lga                   TEXT NOT NULL,
  stage                 TEXT NOT NULL DEFAULT 'referred' CHECK (stage IN ('referred','screened','eligible','enrolled')),
  drop_off_reason       TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id                    TEXT PRIMARY KEY,
  survey_wave           TEXT NOT NULL DEFAULT 'baseline' CHECK (survey_wave IN ('baseline','midline','endline')),
  lga                   TEXT NOT NULL,
  community             TEXT,
  respondent_gender     TEXT CHECK (respondent_gender IN ('female','male','other')),
  enumerator_id         TEXT,
  gps_lat               REAL,
  gps_lng               REAL,
  duration_seconds      INTEGER,
  is_duplicate          INTEGER NOT NULL DEFAULT 0,
  answers               JSONB NOT NULL DEFAULT '{}'::jsonb,
  collected_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS export_audit_log (
  id                    TEXT PRIMARY KEY,
  admin_id              TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  what                  TEXT NOT NULL,
  purpose               TEXT NOT NULL,
  exported_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broadcasts (
  id                    TEXT PRIMARY KEY,
  sender_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  audience_filter       TEXT NOT NULL,
  title                 TEXT NOT NULL,
  body                  TEXT NOT NULL,
  sent_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reach_count           INTEGER NOT NULL DEFAULT 0,
  open_count            INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS content_lessons_meta (
  lesson_id             TEXT PRIMARY KEY REFERENCES lessons(id) ON DELETE CASCADE,
  views                 INTEGER NOT NULL DEFAULT 0,
  completion_rate       REAL NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_circle ON posts(circle_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_lga ON referrals(lga);
CREATE INDEX IF NOT EXISTS idx_survey_lga_wave ON survey_responses(lga, survey_wave);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
-- Additive and repeatable. Custom app sessions authorize server-side access.
-- Preserve historical rows even when an account is removed.
CREATE TABLE IF NOT EXISTS trainer_assignments (
  id TEXT PRIMARY KEY,
  trainer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  participant_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  assigned_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unassigned_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS trainer_assignments_active_pair ON trainer_assignments(trainer_id, participant_id) WHERE unassigned_at IS NULL;
CREATE INDEX IF NOT EXISTS trainer_assignments_trainer ON trainer_assignments(trainer_id);
CREATE INDEX IF NOT EXISTS trainer_assignments_participant ON trainer_assignments(participant_id);
CREATE INDEX IF NOT EXISTS trainer_assignments_admin ON trainer_assignments(assigned_by);
CREATE TABLE IF NOT EXISTS sponsor_sponsorships (
  id TEXT PRIMARY KEY,
  sponsor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  participant_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  sponsored_since TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS sponsor_sponsorships_active_pair ON sponsor_sponsorships(sponsor_id, participant_id) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS sponsor_sponsorships_sponsor ON sponsor_sponsorships(sponsor_id);
CREATE INDEX IF NOT EXISTS sponsor_sponsorships_participant ON sponsor_sponsorships(participant_id);
ALTER TABLE trainer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_sponsorships ENABLE ROW LEVEL SECURITY;
-- No Data API policies: this app uses its own server-side session system.
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON trainer_assignments, sponsor_sponsorships FROM anon;
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON trainer_assignments, sponsor_sponsorships FROM authenticated;
  END IF;
END $$;
