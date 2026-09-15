-- SheRISE data model — implements Section 9 of the build spec exactly.
-- Engine: SQLite (better-sqlite3) standing in for Supabase/Postgres in this
-- environment (no external DB credentials available). Field names, entities,
-- and relationships match the spec 1:1 so a swap to Postgres/Supabase later
-- is a drop-in migration, not a redesign. RLS policies described in the spec
-- are enforced at the application layer in src/lib/access.ts since SQLite
-- has no native row-level security — see that file for the exact rules.

PRAGMA foreign_keys = ON;

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
  last_lesson_date      TEXT,
  skill_category        TEXT,                        -- chosen at onboarding (pick-path screen)
  age                   INTEGER,
  onboarding_complete   INTEGER NOT NULL DEFAULT 0,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sponsor_profiles (
  user_id               TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
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
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at            TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id                    TEXT PRIMARY KEY,
  destination           TEXT NOT NULL,   -- phone or email
  code                  TEXT NOT NULL,
  purpose               TEXT NOT NULL DEFAULT 'signup',
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at            TEXT NOT NULL,
  consumed              INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS circles (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  description           TEXT,
  lga                   TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS circle_members (
  circle_id             TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at             TEXT NOT NULL DEFAULT (datetime('now')),
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
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reactions (
  id                    TEXT PRIMARY KEY,
  post_id               TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind                  TEXT NOT NULL CHECK (kind IN ('cheer','hold','celebrate')),
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id                    TEXT PRIMARY KEY,
  post_id               TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body                  TEXT NOT NULL,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
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
  completed_at          TEXT,
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
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS medals (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code                  TEXT NOT NULL,
  label                 TEXT NOT NULL,
  earned_at             TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trainer_notes (
  id                    TEXT PRIMARY KEY,
  trainer_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body                  TEXT NOT NULL,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dm_messages (
  id                    TEXT PRIMARY KEY,
  trainer_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body                  TEXT NOT NULL,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind                  TEXT NOT NULL CHECK (kind IN ('reaction','comment','milestone_verified','broadcast','trainer_message','circle')),
  actor_id              TEXT REFERENCES users(id) ON DELETE SET NULL,
  post_id               TEXT REFERENCES posts(id) ON DELETE CASCADE,
  body                  TEXT NOT NULL,
  read_at               TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS referrals (
  id                    TEXT PRIMARY KEY,
  participant_id        TEXT REFERENCES users(id) ON DELETE SET NULL,
  source                TEXT NOT NULL,
  lga                   TEXT NOT NULL,
  stage                 TEXT NOT NULL DEFAULT 'referred' CHECK (stage IN ('referred','screened','eligible','enrolled')),
  drop_off_reason       TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
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
  answers               TEXT NOT NULL DEFAULT '{}',  -- JSONB equivalent
  collected_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS export_audit_log (
  id                    TEXT PRIMARY KEY,
  admin_id              TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  what                  TEXT NOT NULL,
  purpose               TEXT NOT NULL,
  exported_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS broadcasts (
  id                    TEXT PRIMARY KEY,
  sender_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  audience_filter       TEXT NOT NULL,
  title                 TEXT NOT NULL,
  body                  TEXT NOT NULL,
  sent_at               TEXT NOT NULL DEFAULT (datetime('now')),
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
