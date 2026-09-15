import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canReadTrainerNotes } from "@/lib/access";

// GET /api/admin/participants/{id} — participant detail (screen 27)
// identity card + trainer notes (private, staff-only) + outcome KPIs + timeline
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  if (!["admin", "trainer", "sponsor"].includes(user.role)) {
    return Response.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;

  const db = getDb();
  const participant = db
    .prepare(`SELECT id, first_name, last_name, lga, skill_category, xp_total, streak_count, age, created_at FROM users WHERE id = ? AND role = 'participant'`)
    .get(id) as Record<string, unknown> | undefined;
  if (!participant) return Response.json({ code: "NOT_FOUND", message: "Participant not found." }, { status: 404 });

  const medals = db.prepare(`SELECT * FROM medals WHERE user_id = ?`).all(id);
  const milestones = db.prepare(`SELECT * FROM milestones WHERE user_id = ? ORDER BY created_at DESC`).all(id) as Record<string, unknown>[];
  const incomeLog = milestones.filter((m) => m.type === "first_income" && m.amount);

  const totalLessons = (
    db
      .prepare(`SELECT COUNT(*) as c FROM lessons l JOIN pathways p ON p.id = l.pathway_id WHERE p.skill_category = ?`)
      .get(participant.skill_category) as { c: number }
  ).c;
  const doneLessons = (db.prepare(`SELECT COUNT(*) as c FROM lesson_progress WHERE user_id = ? AND status = 'done'`).get(id) as { c: number }).c;

  const timeline = db
    .prepare(
      `SELECT 'lesson' as kind, completed_at as at, lesson_id as ref FROM lesson_progress WHERE user_id = ? AND status = 'done'
       UNION ALL
       SELECT 'post' as kind, created_at as at, id as ref FROM posts WHERE author_id = ?
       ORDER BY at DESC LIMIT 20`
    )
    .all(id, id);

  let trainerNotes: unknown[] = [];
  if (user.role === "admin") {
    trainerNotes = db
      .prepare(`SELECT tn.*, u.first_name as trainer_first_name FROM trainer_notes tn JOIN users u ON u.id = tn.trainer_id WHERE tn.participant_id = ? ORDER BY tn.created_at DESC`)
      .all(id);
  } else if (user.role === "trainer") {
    trainerNotes = db
      .prepare(`SELECT tn.*, u.first_name as trainer_first_name FROM trainer_notes tn JOIN users u ON u.id = tn.trainer_id WHERE tn.participant_id = ? AND tn.trainer_id = ? ORDER BY tn.created_at DESC`)
      .all(id, user.id);
  }
  // sponsors: trainerNotes stays [] — canReadTrainerNotes would also reject this.
  void canReadTrainerNotes;

  return Response.json({
    participant: {
      firstName: participant.first_name,
      lastName: user.role === "sponsor" ? null : participant.last_name,
      lga: participant.lga,
      skill: participant.skill_category,
      xpTotal: participant.xp_total,
      streak: participant.streak_count,
      age: user.role === "sponsor" ? null : participant.age,
      joinedAt: participant.created_at,
    },
    outcomes: {
      progressPercent: totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0,
      medalsCount: medals.length,
      milestonesCount: milestones.length,
      firstIncomeTotal: incomeLog.reduce((s, m) => s + ((m.amount as number) || 0), 0),
    },
    incomeSparkline: incomeLog.map((m) => m.amount),
    timeline,
    trainerNotes: user.role === "sponsor" ? [] : trainerNotes,
  });
}
