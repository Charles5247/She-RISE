import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/posts/[id] — post detail (screen 11)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { id } = await params;

  const db = getDb();
  const post = db
    .prepare(
      `SELECT p.*, u.first_name as author_first_name, u.avatar_url as author_avatar_url, u.is_verified_trainer as author_is_trainer
       FROM posts p JOIN users u ON u.id = p.author_id WHERE p.id = ?`
    )
    .get(id) as Record<string, unknown> | undefined;

  if (!post) return Response.json({ code: "NOT_FOUND", message: "Post not found." }, { status: 404 });

  const reactions = db.prepare(`SELECT kind, COUNT(*) as c FROM reactions WHERE post_id = ? GROUP BY kind`).all(id) as {
    kind: string;
    c: number;
  }[];
  const namedReactors = db
    .prepare(`SELECT u.first_name, rx.kind FROM reactions rx JOIN users u ON u.id = rx.user_id WHERE rx.post_id = ? ORDER BY rx.created_at DESC`)
    .all(id) as { first_name: string; kind: string }[];
  const myReaction = db.prepare(`SELECT kind FROM reactions WHERE post_id = ? AND user_id = ?`).get(id, user.id) as
    | { kind: string }
    | undefined;
  const comments = db
    .prepare(
      `SELECT c.id, c.body, c.created_at, u.first_name, u.avatar_url, u.is_verified_trainer
       FROM comments c JOIN users u ON u.id = c.author_id WHERE c.post_id = ? ORDER BY c.created_at ASC`
    )
    .all(id) as Record<string, unknown>[];

  return Response.json({
    post: {
      id: post.id,
      author: { id: post.author_id, firstName: post.author_first_name, avatarUrl: post.author_avatar_url, isVerifiedTrainer: !!post.author_is_trainer },
      body: post.body,
      photoUrl: post.photo_url,
      milestoneType: post.milestone_type,
      createdAt: post.created_at,
      reactions: { cheer: 0, hold: 0, celebrate: 0, ...Object.fromEntries(reactions.map((x) => [x.kind, x.c])) },
      namedReactors,
      myReaction: myReaction?.kind ?? null,
    },
    comments: comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.created_at,
      author: { firstName: c.first_name, avatarUrl: c.avatar_url, isVerifiedTrainer: !!c.is_verified_trainer },
    })),
  });
}
