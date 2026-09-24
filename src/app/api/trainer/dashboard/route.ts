import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";
export const GET = withErrorHandling(async () => {
  const user = await requireRole("trainer");
  if (user instanceof Response) return user;
  const db = getDb();
  const profile = await db
    .prepare("SELECT specialty, rating FROM trainer_profiles WHERE user_id = ?")
    .get(user.id);
  const participants = await db
    .prepare(
      `SELECT u.id, u.first_name, u.lga, u.skill_category, r.assigned_at,
 COALESCE((SELECT jsonb_agg(n ORDER BY n.created_at DESC) FROM
 (SELECT id, body, created_at FROM trainer_notes WHERE trainer_id = r.trainer_id AND participant_id = u.id ORDER BY created_at DESC LIMIT 5) n), '[]'::jsonb) AS recent_notes
 FROM trainer_assignments r JOIN users u ON u.id = r.participant_id
 WHERE r.trainer_id = ? AND r.unassigned_at IS NULL ORDER BY u.first_name, u.id`,
    )
    .all(user.id);
  const stats = await db
    .prepare("SELECT COUNT(*) AS notes FROM trainer_notes WHERE trainer_id = ?")
    .get(user.id);
  return Response.json({
    ...profile,
    learners: participants.length,
    notes: stats?.notes ?? 0,
    participants,
  });
});
