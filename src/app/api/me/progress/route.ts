import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";

// GET /me/progress — milestones, streak, income log (screen 17)
export const GET = withErrorHandling(async () => {
  const user = await requireRole("participant");
  if (user instanceof Response) return user;

  const db = getDb();
  const stats = (await db.prepare(`SELECT xp_total, streak_count, last_lesson_date FROM users WHERE id = ?`).get(user.id)) as {
    xp_total: number;
    streak_count: number;
    last_lesson_date: string | null;
  };

  const medals = await db.prepare(`SELECT * FROM medals WHERE user_id = ? ORDER BY earned_at DESC`).all(user.id);

  const totalLessons = ((await db.prepare(`SELECT COUNT(*) as c FROM lessons`).get()) as { c: number }).c;
  const doneLessons = (
    (await db.prepare(`SELECT COUNT(*) as c FROM lesson_progress WHERE user_id = ? AND status = 'done'`).get(user.id)) as { c: number }
  ).c;

  const milestones = (await db
    .prepare(`SELECT * FROM milestones WHERE user_id = ? ORDER BY created_at DESC`)
    .all(user.id)) as Record<string, unknown>[];

  const incomeLog = milestones
    .filter((m) => m.type === "first_income" && m.amount)
    .map((m) => ({ amount: Number(m.amount), date: m.created_at }))
    .reverse();

  const recentLessons = await db.prepare(`SELECT l.id, l.title, lp.completed_at AS "completedAt"
    FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id
    WHERE lp.user_id = ? AND lp.status = 'done' ORDER BY lp.completed_at DESC LIMIT 5`).all(user.id);
  const activity = await db.prepare<{ date: string; count: number }>(`SELECT (completed_at AT TIME ZONE 'UTC')::date::text AS date, COUNT(*) AS count
    FROM lesson_progress WHERE user_id = ? AND status = 'done' AND completed_at >= (NOW() AT TIME ZONE 'UTC')::date - INTERVAL '6 days'
    GROUP BY 1`).all(user.id);
  const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * 86400000).toISOString().slice(0, 10);
    return { date, count: Number(activity.find(day => day.date === date)?.count ?? 0) };
  });
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

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
    streakCount: stats.last_lesson_date && stats.last_lesson_date >= yesterday ? stats.streak_count : 0,
    incomeTotal: incomeLog.reduce((total, entry) => total + entry.amount, 0),
    lessonsCompleted: doneLessons,
    totalLessons,
    weeklyActivity,
    recentLessons,
    progressPercent: totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0,
    medalsEarned: medals.length,
    medals: ALL_MEDAL_CODES.map((m) => ({ ...m, earned: earnedCodes.has(m.code) })),
    milestones,
    incomeLog,
  });
});
