import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/admin/overview — Dashboard home KPIs (screen 25)
// admin + trainer (read-only) + sponsor (read-only aggregate) per spec 9/10.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  if (!["admin", "trainer", "sponsor"].includes(user.role)) {
    return Response.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });
  }

  const db = getDb();
  const totalRespondents = (db.prepare(`SELECT COUNT(*) as c FROM survey_responses`).get() as { c: number }).c;
  const communities = (db.prepare(`SELECT COUNT(DISTINCT community) as c FROM survey_responses`).get() as { c: number }).c;
  const lgas = (db.prepare(`SELECT COUNT(DISTINCT lga) as c FROM survey_responses`).get() as { c: number }).c;
  const women = (db.prepare(`SELECT COUNT(*) as c FROM survey_responses WHERE respondent_gender = 'female'`).get() as { c: number }).c;
  const men = (db.prepare(`SELECT COUNT(*) as c FROM survey_responses WHERE respondent_gender = 'male'`).get() as { c: number }).c;

  const challengeRows = db.prepare(`SELECT answers FROM survey_responses`).all() as { answers: string }[];
  const challengeCounts: Record<string, number> = {};
  for (const r of challengeRows) {
    try {
      const a = JSON.parse(r.answers);
      if (a.main_challenge) challengeCounts[a.main_challenge] = (challengeCounts[a.main_challenge] || 0) + 1;
    } catch {}
  }
  const topChallenges = Object.entries(challengeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, count]) => ({ label, count }));

  const participantsCount = (db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'participant'`).get() as { c: number }).c;
  const activeStreaks = (db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'participant' AND streak_count > 0`).get() as { c: number }).c;
  const avgStreak = (db.prepare(`SELECT AVG(streak_count) as a FROM users WHERE role = 'participant'`).get() as { a: number | null }).a || 0;

  const mapDots = db
    .prepare(
      `SELECT lga, COUNT(*) as c FROM users WHERE role = 'participant' AND lga IS NOT NULL GROUP BY lga`
    )
    .all() as { lga: string; c: number }[];

  return Response.json({
    kpis: { totalRespondents, communities, lgas, women, men },
    topChallenges,
    momentum: { participantsCount, activeStreaks, avgStreak: Math.round(avgStreak * 10) / 10 },
    map: mapDots,
  });
}
