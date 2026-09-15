import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /me/progress — milestones, streak, income log (screen 17)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });

  const db = getDb();
  const stats = db.prepare(`SELECT xp_total, streak_count FROM users WHERE id = ?`).get(user.id) as {
    xp_total: number;
    streak_count: number;
  };

  const medals = db.prepare(`SELECT * FROM medals WHERE user_id = ? ORDER BY earned_at DESC`).all(user.id);

  const totalLessons = (db.prepare(`SELECT COUNT(*) as c FROM lessons`).get() as { c: number }).c;
  const doneLessons = (
    db.prepare(`SELECT COUNT(*) as c FROM lesson_progress WHERE user_id = ? AND status = 'done'`).get(user.id) as { c: number }
  ).c;

  const milestones = db
    .prepare(`SELECT * FROM milestones WHERE user_id = ? ORDER BY created_at DESC`)
    .all(user.id) as Record<string, unknown>[];

  const incomeLog = milestones
    .filter((m) => m.type === "first_income" && m.amount)
    .map((m) => ({ amount: m.amount, date: m.created_at }));

  const ALL_MEDAL_CODES = [
    { code: "first_lesson", label: "First Lesson" },
    { code: "halfway", label: "Halfway Hero" },
    { code: "pathway_complete", label: "Pathway Complete" },
    { code: "first_income", label: "First Income" },
    { code: "streak_7", label: "7-Day Streak" },
    { code: "streak_30", label: "30-Day Streak" },
    { code: "community_voice", label: "Community Voice" },
    { code: "helping_hand", label: "Helping Hand" },
  ];
  const earnedCodes = new Set((medals as { code: string }[]).map((m) => m.code));

  return Response.json({
    xpTotal: stats.xp_total,
    streakCount: stats.streak_count,
    progressPercent: totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0,
    medalsEarned: medals.length,
    medals: ALL_MEDAL_CODES.map((m) => ({ ...m, earned: earnedCodes.has(m.code) })),
    milestones,
    incomeLog,
  });
}
