import { getDb, newId } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// POST /api/lessons/{id}/complete — awards XP + streak, unlocks the next lesson (screen 16)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { id } = await params;
  const { accuracy } = (await req.json().catch(() => ({}))) as { accuracy?: number };

  const db = getDb();
  const lesson = (await db.prepare(`SELECT * FROM lessons WHERE id = ?`).get(id)) as
    | { id: string; pathway_id: string; xp_value: number; order_index: number }
    | undefined;
  if (!lesson) return Response.json({ code: "NOT_FOUND", message: "Lesson not found." }, { status: 404 });

  const userRow = (await db.prepare(`SELECT xp_total, streak_count, last_lesson_date FROM users WHERE id = ?`).get(user.id)) as {
    xp_total: number;
    streak_count: number;
    last_lesson_date: string | null;
  };

  const today = new Date().toISOString().slice(0, 10);
  let newStreak = userRow.streak_count;
  if (userRow.last_lesson_date !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    newStreak = userRow.last_lesson_date === yesterday ? userRow.streak_count + 1 : 1;
  }

  const tx = db.transaction(async (t) => {
    await t.prepare(
      `INSERT INTO lesson_progress (user_id, lesson_id, status, completed_at, accuracy)
       VALUES (?, ?, 'done', NOW(), ?)
       ON CONFLICT(user_id, lesson_id) DO UPDATE SET status = 'done', completed_at = NOW(), accuracy = excluded.accuracy`
    ).run(user.id, id, accuracy ?? null);

    await t.prepare(
      `UPDATE users SET xp_total = xp_total + ?, streak_count = ?, last_lesson_date = ? WHERE id = ?`
    ).run(lesson.xp_value, newStreak, today, user.id);

    // unlock next lesson in the pathway
    const next = (await t
      .prepare(`SELECT id FROM lessons WHERE pathway_id = ? AND order_index = ?`)
      .get(lesson.pathway_id, lesson.order_index + 1)) as { id: string } | undefined;
    if (next) {
      await t.prepare(
        `INSERT INTO lesson_progress (user_id, lesson_id, status) VALUES (?, ?, 'current')
         ON CONFLICT(user_id, lesson_id) DO NOTHING`
      ).run(user.id, next.id);
    }

    // medal checks
    const doneCount = (
      (await t.prepare(`SELECT COUNT(*) as c FROM lesson_progress WHERE user_id = ? AND status = 'done'`).get(user.id)) as { c: number }
    ).c;
    if (doneCount === 1) {
      await t.prepare(`INSERT INTO medals (id, user_id, code, label) VALUES (?, ?, 'first_lesson', 'First Lesson') ON CONFLICT (user_id, code) DO NOTHING`).run(
        newId("med"),
        user.id
      );
    }
  });
  await tx();

  return Response.json({ ok: true, xpAwarded: lesson.xp_value, streakCount: newStreak, totalXp: userRow.xp_total + lesson.xp_value });
}
