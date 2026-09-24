import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";
export const GET = withErrorHandling(async () => {
  const user = await requireRole("sponsor");
  if (user instanceof Response) return user;
  const db = getDb();
  const profile = await db
    .prepare(
      "SELECT sponsor_since_year FROM sponsor_profiles WHERE user_id = ?",
    )
    .get(user.id);
  const participants = await db
    .prepare(
      `SELECT u.id, u.first_name, u.lga, u.skill_category, r.sponsored_since,
 (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.user_id = u.id AND lp.status = 'done') AS lessons_completed
 FROM sponsor_sponsorships r JOIN users u ON u.id = r.participant_id
 WHERE r.sponsor_id = ? AND r.ended_at IS NULL ORDER BY u.first_name, u.id`,
    )
    .all(user.id);
  return Response.json({
    sinceYear: profile?.sponsor_since_year ?? null,
    womenSponsored: participants.length,
    participants,
  });
});
