import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// POST /api/crosspost/{fb|linkedin}/undo — 30-second undo toast (spec 6.10)
export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { provider } = await params;
  const { postId } = (await req.json().catch(() => ({}))) as { postId?: string };
  if (!postId) return Response.json({ code: "BAD_REQUEST", message: "postId required." }, { status: 400 });

  const db = getDb();
  const post = (await db.prepare(`SELECT author_id, crosspost_fb_status, crosspost_li_status FROM posts WHERE id = ?`).get(postId)) as
    | { author_id: string; crosspost_fb_status: string; crosspost_li_status: string }
    | undefined;
  if (!post) return Response.json({ code: "NOT_FOUND", message: "Post not found." }, { status: 404 });
  if (post.author_id !== user.id) return Response.json({ code: "FORBIDDEN", message: "Not your post." }, { status: 403 });

  const column = provider === "fb" ? "crosspost_fb_status" : "crosspost_li_status";
  const currentStatus = provider === "fb" ? post.crosspost_fb_status : post.crosspost_li_status;
  if (currentStatus === "sent") {
    return Response.json({ code: "TOO_LATE", message: "This has already been posted." }, { status: 409 });
  }
  await db.prepare(`UPDATE posts SET ${column} = 'undone' WHERE id = ?`).run(postId);
  return Response.json({ ok: true });
}
