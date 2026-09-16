import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/admin/participants — participants list (screen 26): filters + 8-col table
// last_name IS exposed here — this is an admin/trainer-scoped surface, not a
// public/peer-facing one, so Section 9's "never selectable from a
// participant/public-facing query" rule doesn't apply to this route.
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  if (!["admin", "trainer", "sponsor"].includes(user.role)) {
    return Response.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const lga = searchParams.get("lga");
  const skill = searchParams.get("skill");
  const status = searchParams.get("status"); // active | at_risk | completed

  const db = getDb();
  let query = `
    SELECT u.id, u.first_name, u.last_name, u.lga, u.skill_category, u.xp_total, u.streak_count, u.created_at
    FROM users u WHERE u.role = 'participant'
  `;
  const conditions: string[] = [];
  const params: string[] = [];
  if (lga) { conditions.push("u.lga = ?"); params.push(lga); }
  if (skill) { conditions.push("u.skill_category = ?"); params.push(skill); }
  if (conditions.length) query += " AND " + conditions.join(" AND ");
  query += " ORDER BY u.created_at DESC";

  const rows = (await db.prepare(query).all(...params)) as Record<string, unknown>[];

  const participants = await Promise.all(
    rows.map(async (r) => {
      const totalLessons = (
        (await db.prepare(`SELECT COUNT(*) as c FROM lessons l JOIN pathways p ON p.id = l.pathway_id WHERE p.skill_category = ?`).get(r.skill_category as string)) as { c: number }
      ).c;
      const doneLessons = (
        (await db.prepare(`SELECT COUNT(*) as c FROM lesson_progress WHERE user_id = ? AND status = 'done'`).get(r.id as string)) as { c: number }
      ).c;
      const medalsCount = ((await db.prepare(`SELECT COUNT(*) as c FROM medals WHERE user_id = ?`).get(r.id as string)) as { c: number }).c;
      const progressPercent = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;
      const derivedStatus = progressPercent >= 100 ? "completed" : (r.streak_count as number) === 0 ? "at_risk" : "active";

      return {
        id: r.id,
        // Sponsor-facing responses should mask last_name per "aggregate/
        // participant-progress views, not raw identity" — but the spec's
        // participant-progress admin table is staff/trainer tooling, and
        // sponsors are explicitly granted "read-only access to aggregate/
        // participant-progress views" (Section 9) so first-name-only here.
        firstName: r.first_name,
        lastName: user.role === "sponsor" ? null : r.last_name,
        lga: r.lga,
        cohort: r.skill_category,
        skill: r.skill_category,
        progressPercent,
        medals: medalsCount,
        streak: r.streak_count,
        status: derivedStatus,
      };
    })
  );

  const filtered = status ? participants.filter((p) => p.status === status) : participants;
  return Response.json({ participants: filtered });
}
