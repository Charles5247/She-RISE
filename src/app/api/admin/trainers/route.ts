import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";
export const GET = withErrorHandling(async () => {
  const actor = await requireRole("admin");
  if (actor instanceof Response) return actor;
  const db = getDb();
  const trainers = await db
    .prepare(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.lga, tp.specialty, tp.rating,
 (SELECT COUNT(*) FROM trainer_notes n WHERE n.trainer_id = u.id) AS notes_written,
 (SELECT COUNT(*) FROM trainer_assignments r JOIN users p ON p.id = r.participant_id WHERE r.trainer_id = u.id AND r.unassigned_at IS NULL) AS participant_count
 FROM users u LEFT JOIN trainer_profiles tp ON tp.user_id = u.id WHERE u.role = 'trainer' ORDER BY u.first_name`,
    )
    .all();
  const sponsors = await db
    .prepare(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, sp.sponsor_since_year,
 (SELECT COUNT(*) FROM sponsor_sponsorships r JOIN users p ON p.id = r.participant_id WHERE r.sponsor_id = u.id AND r.ended_at IS NULL) AS participant_count
 FROM users u LEFT JOIN sponsor_profiles sp ON sp.user_id = u.id WHERE u.role = 'sponsor' ORDER BY u.first_name`,
    )
    .all();
  const participants = await db
    .prepare(
      "SELECT id, first_name, lga, skill_category FROM users WHERE role = 'participant' ORDER BY first_name, id",
    )
    .all();
  return Response.json({ trainers, sponsors, participants });
});
