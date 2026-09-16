import { getDb, newId } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// POST /api/posts/[id]/comments — trainer comments carry the verified badge (screen 11)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { id } = await params;

  const { body } = (await req.json().catch(() => ({}))) as { body?: string };
  if (!body || !body.trim()) {
    return Response.json({ code: "BAD_REQUEST", message: "Comment cannot be empty." }, { status: 400 });
  }

  const db = getDb();
  const post = (await db.prepare(`SELECT author_id FROM posts WHERE id = ?`).get(id)) as { author_id: string } | undefined;
  if (!post) return Response.json({ code: "NOT_FOUND", message: "Post not found." }, { status: 404 });

  const commentId = newId("cm");
  await db.prepare(`INSERT INTO comments (id, post_id, author_id, body) VALUES (?, ?, ?, ?)`).run(commentId, id, user.id, body.trim());

  if (post.author_id !== user.id) {
    await db.prepare(
      `INSERT INTO notifications (id, user_id, kind, actor_id, post_id, body) VALUES (?, ?, 'comment', ?, ?, ?)`
    ).run(newId("ntf"), post.author_id, user.id, id, `${user.first_name} commented on your post`);
  }

  return Response.json({ ok: true, commentId });
}
