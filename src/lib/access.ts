/**
 * Application-layer enforcement of the Row Level Security policies described
 * in Section 9 of the spec. SQLite has no native RLS, so every query path
 * that touches a restricted table MUST go through these guards instead of
 * querying the table directly. This file is the single source of truth for
 * "who can see what" — do not duplicate these checks ad hoc in routes.
 *
 * Rules implemented (verbatim from spec Section 9):
 * 1. A participant can read her own trainer_notes, but not another participant's.
 * 2. last_name, survey_responses, and export_audit_log are never exposed to the
 *    participant app's API surface at all — not just hidden in the UI.
 * 3. Sponsors get read-only access to aggregate/participant-progress views, not
 *    to trainer_notes, raw survey_responses, or the data-quality/enumerator
 *    monitoring view.
 * 4. Every row read from /admin/reports or a custom export must write one
 *    export_audit_log row first; the write is transactional with the read —
 *    if the audit write fails, the export must fail too.
 */
import type { SessionUser } from "./auth";
import { getDb, newId } from "./db";

export function canReadTrainerNotes(viewer: SessionUser, participantId: string, trainerId: string): boolean {
  if (viewer.role === "admin") return true;
  if (viewer.role === "trainer" && viewer.id === trainerId) return true;
  if (viewer.role === "participant" && viewer.id === participantId) return true;
  return false; // sponsors: never. other participants: never.
}

export function canAccessSurveyResponses(viewer: SessionUser): boolean {
  // participant app must never reach this surface at all
  return viewer.role === "admin";
}

export function canAccessEnumeratorMonitoring(viewer: SessionUser): boolean {
  // "restrict it to admin role, not sponsor role" — trainers excluded implicitly too
  return viewer.role === "admin";
}

export function canAccessExportAuditLog(viewer: SessionUser): boolean {
  return viewer.role === "admin";
}

export function isPublicFacingSurface(viewer: SessionUser | null): boolean {
  return !viewer || viewer.role === "participant";
}

/**
 * Strips last_name from a user object for any participant-facing/public
 * response. Call this before returning ANY user data to a non-admin,
 * non-trainer-note context.
 */
export function toPublicUser<T extends { last_name?: unknown }>(u: T): Omit<T, "last_name"> {
  const { last_name, ...rest } = u;
  void last_name;
  return rest;
}

/**
 * Transactional export-audit-log write. Per spec: "if the audit write fails,
 * the export must fail too." We wrap the caller-supplied read in the same
 * Postgres transaction as the audit insert (via `db.transaction()`, backed
 * by postgres.js's `sql.begin()`) so a failure rolls back cleanly. `read` is
 * async and MUST use the transaction-scoped `tx` handle it's given, not the
 * outer `getDb()` result, so both statements run on the same connection.
 */
export async function withExportAudit<T>(
  adminId: string,
  what: string,
  purpose: string,
  read: (tx: ReturnType<typeof getDb>) => Promise<T>
): Promise<T> {
  if (!purpose || !purpose.trim()) {
    throw new Error("EXPORT_PURPOSE_REQUIRED");
  }
  const db = getDb();
  const tx = db.transaction(async (t) => {
    await t.prepare(
      `INSERT INTO export_audit_log (id, admin_id, what, purpose) VALUES (?, ?, ?, ?)`
    ).run(newId("exp"), adminId, what, purpose.trim());
    return read(t);
  });
  return tx();
}
