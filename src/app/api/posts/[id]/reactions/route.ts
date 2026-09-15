import { getDb, newId } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// POST /api/posts/[id]/reactions — named reactions (cheer/hold/celebrate), not likes
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { id } = await params;

  const { kind } = (await req.json().catch(() => ({}))) as { kind?: string };
  if (!["cheer", "hold", "celebrate"].includes(kind || "")) {
    return Response.json({ code: "BAD_REQUEST", message: "kind must be cheer, hold, or celebrate." }, { status: 400 });
  }

  const db = getDb();
  const post = db.prepare(`SELECT author_id FROM posts WHERE id = ?`).get(id) as { author_id: string } | undefined;
  if (!post) return Response.json({ code: "NOT_FOUND", message: "Post not found." }, { status: 404 });

  db.prepare(
    `INSERT INTO reactions (id, post_id, user_id, kind) VALUES (?, ?, ?, ?)
     ON CONFLICT(post_id, user_id) DO UPDATE SET kind = excluded.kind`
  ).run(newId("rx"), id, user.id, kind);

  if (post.author_id !== user.id) {
    db.prepare(
      `INSERT INTO notifications (id, user_id, kind, actor_id, post_id, body) VALUES (?, ?, 'reaction', ?, ?, ?)`
    ).run(newId("ntf"), post.author_id, user.id, id, `${user.first_name} ${kind}ed your post`);
  }

  return Response.json({ ok: true });
}

// DELETE — remove my reaction
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  db.prepare(`DELETE FROM reactions WHERE post_id = ? AND user_id = ?`).run(id, user.id);
  return Response.json({ ok: true });
}
