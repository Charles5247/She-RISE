import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { facebookProvider, linkedinProvider } from "@/lib/crosspost";

// POST /api/crosspost/{fb|linkedin} — takes post_id; actually sends after the
// 30-second undo window (client calls this once the toast times out).
export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { provider } = await params;
  if (provider !== "fb" && provider !== "linkedin") {
    return Response.json({ code: "BAD_REQUEST", message: "provider must be fb or linkedin." }, { status: 400 });
  }

  const { postId } = (await req.json().catch(() => ({}))) as { postId?: string };
  if (!postId) return Response.json({ code: "BAD_REQUEST", message: "postId required." }, { status: 400 });

  const db = getDb();
  const post = db
    .prepare(`SELECT author_id, crosspost_copy, photo_url, crosspost_fb_status, crosspost_li_status FROM posts WHERE id = ?`)
    .get(postId) as { author_id: string; crosspost_copy: string | null; photo_url: string | null; crosspost_fb_status: string; crosspost_li_status: string } | undefined;

  if (!post) return Response.json({ code: "NOT_FOUND", message: "Post not found." }, { status: 404 });
  if (post.author_id !== user.id) return Response.json({ code: "FORBIDDEN", message: "Not your post." }, { status: 403 });

  const statusField = provider === "fb" ? post.crosspost_fb_status : post.crosspost_li_status;
  if (statusField === "undone") {
    return Response.json({ code: "UNDONE", message: "This cross-post was undone." }, { status: 409 });
  }
  if (statusField === "sent") {
    return Response.json({ ok: true, alreadySent: true });
  }

  const client = provider === "fb" ? facebookProvider : linkedinProvider;
  const result = await client.send({ userId: user.id, copy: post.crosspost_copy || "", photoUrl: post.photo_url });

  const column = provider === "fb" ? "crosspost_fb_status" : "crosspost_li_status";
  db.prepare(`UPDATE posts SET ${column} = ? WHERE id = ?`).run(result.ok ? "sent" : "failed", postId);

  return Response.json({ ok: result.ok, externalId: result.externalId, error: result.error });
}
