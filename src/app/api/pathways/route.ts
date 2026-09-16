import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/pathways — pathway home listing (screen 14). Returns pathways with
// the current user's progress rolled up per pathway.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });

  const db = getDb();
  const pathways = (await db.prepare(`SELECT * FROM pathways ORDER BY order_index`).all()) as Record<string, unknown>[];
  const currentUserSkill = await userSkill(user);

  const result = await Promise.all(
    pathways.map(async (p) => {
      const lessons = (await db
        .prepare(
          `SELECT l.id, l.title, l.order_index, l.xp_value, lp.status
           FROM lessons l LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ?
           WHERE l.pathway_id = ? ORDER BY l.order_index`
        )
        .all(user.id, p.id as string)) as { id: string; title: string; order_index: number; xp_value: number; status: string | null }[];

      const doneCount = lessons.filter((l) => l.status === "done").length;
      return {
        id: p.id,
        title: p.title,
        skillCategory: p.skill_category,
        description: p.description,
        lessons: lessons.map((l) => ({ ...l, status: l.status || (doneCount === 0 && l.order_index === 1 ? "current" : "locked") })),
        progressPercent: lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0,
        isCurrent: p.skill_category === currentUserSkill,
      };
    })
  );

  return Response.json({ pathways: result });
}

async function userSkill(user: { id: string }) {
  const db = getDb();
  const row = (await db.prepare(`SELECT skill_category FROM users WHERE id = ?`).get(user.id)) as { skill_category: string | null } | undefined;
  return row?.skill_category;
}
