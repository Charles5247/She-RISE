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
