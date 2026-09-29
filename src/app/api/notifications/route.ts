import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";

// GET /api/notifications — grouped by day (screen 12)
export const GET = withErrorHandling(async () => {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });

  const db = getDb();
  const rows = (await db
    .prepare(
      `SELECT n.*, u.first_name as actor_first_name, u.avatar_url as actor_avatar_url
       FROM notifications n LEFT JOIN users u ON u.id = n.actor_id
       WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 100`
    )
    .all(user.id)) as Record<string, unknown>[];

  const today = new Date().toISOString().slice(0, 10);
  const grouped: { today: unknown[]; earlier: unknown[] } = { today: [], earlier: [] };
  for (const r of rows) {
    // created_at comes back from Postgres as a real Date object (TIMESTAMPTZ),
    // not a raw SQLite string, so it must be re-serialized to compare dates.
    const createdAtDate = r.created_at instanceof Date ? r.created_at : new Date(r.created_at as string);
    const bucket = createdAtDate.toISOString().slice(0, 10) === today ? grouped.today : grouped.earlier;
    bucket.push({
      id: r.id,
      kind: r.kind,
      body: r.body,
      postId: r.post_id,
      href: r.href || (r.post_id ? `/posts/${encodeURIComponent(String(r.post_id))}` :
        r.kind === "trainer_message" && user.role === "participant" && r.actor_id ? `/trainer-chat/${encodeURIComponent(String(r.actor_id))}` : null),
      actor: r.actor_id ? { firstName: r.actor_first_name, avatarUrl: r.actor_avatar_url } : null,
      createdAt: r.created_at,
      read: !!r.read_at,
    });
  }
  const count = await db.prepare<{ count: number }>("SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL").get(user.id);
  return Response.json({ ...grouped, unreadCount: Number(count?.count ?? 0) }, { headers: { "Cache-Control": "no-store" } });
});

export const PATCH = withErrorHandling(async (req: Request) => {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || (body.id !== undefined && (typeof body.id !== "string" || !body.id))) {
    return Response.json({ message: "Invalid notification ID." }, { status: 400 });
  }
  const { id } = body as { id?: string };
  const db = getDb();
  if (id) {
    await db.prepare(`UPDATE notifications SET read_at = NOW() WHERE id = ? AND user_id = ?`).run(id, user.id);
  } else {
    await db.prepare(`UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL`).run(user.id);
  }
  return Response.json({ ok: true });
});
