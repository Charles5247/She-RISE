import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/lessons/{id} — lesson detail (screen 15): video (480p default, HD opt-in), XP, steps
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { id } = await params;

  const db = getDb();
  const lesson = db.prepare(`SELECT * FROM lessons WHERE id = ?`).get(id) as Record<string, unknown> | undefined;
  if (!lesson) return Response.json({ code: "NOT_FOUND", message: "Lesson not found." }, { status: 404 });

  const progress = db
    .prepare(`SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?`)
    .get(user.id, id) as Record<string, unknown> | undefined;

  const streak = db.prepare(`SELECT streak_count FROM users WHERE id = ?`).get(user.id) as { streak_count: number };

  return Response.json({
    lesson: {
      id: lesson.id,
      title: lesson.title,
      videoUrl480p: lesson.video_url_480p,
      videoUrlHd: lesson.video_url_hd,
      xpValue: lesson.xp_value,
      durationSeconds: lesson.duration_seconds,
      steps: JSON.parse((lesson.steps_json as string) || "[]"),
    },
    progress: progress
      ? { status: progress.status, downloadedOffline: !!progress.downloaded_offline, accuracy: progress.accuracy }
      : { status: "current", downloadedOffline: false, accuracy: null },
    streakCount: streak.streak_count,
  });
}
