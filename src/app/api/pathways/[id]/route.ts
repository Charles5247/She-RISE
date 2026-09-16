import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/pathways/{id} — includes streaming video URL and step reflections per lesson
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { id } = await params;

  const db = getDb();
  const pathway = (await db.prepare(`SELECT * FROM pathways WHERE id = ?`).get(id)) as Record<string, unknown> | undefined;
  if (!pathway) return Response.json({ code: "NOT_FOUND", message: "Pathway not found." }, { status: 404 });

  const lessons = (await db
    .prepare(
      `SELECT l.*, lp.status as progress_status, lp.completed_at, lp.downloaded_offline
       FROM lessons l LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ?
       WHERE l.pathway_id = ? ORDER BY l.order_index`
    )
    .all(user.id, id)) as Record<string, unknown>[];

  return Response.json({
    pathway,
    lessons: lessons.map((l) => ({
      id: l.id,
      title: l.title,
      xpValue: l.xp_value,
      orderIndex: l.order_index,
      durationSeconds: l.duration_seconds,
      status: l.progress_status || "locked",
      downloadedOffline: !!l.downloaded_offline,
      steps: JSON.parse((l.steps_json as string) || "[]"),
    })),
  });
}
