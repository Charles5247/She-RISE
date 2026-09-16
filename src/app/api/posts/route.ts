import { NextRequest } from "next/server";
import { getDb, newId } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { generateCrosspostCopy, facebookProvider, linkedinProvider, FEATURE_CROSSPOST_LIVE } from "@/lib/crosspost";

interface PostRow {
  id: string;
  author_id: string;
  body: string;
  photo_url: string | null;
  milestone_type: string;
  crosspost_fb: number;
  crosspost_linkedin: number;
  crosspost_fb_status: string;
  crosspost_li_status: string;
  circle_id: string | null;
  created_at: string;
  author_first_name: string;
  author_avatar_url: string | null;
  author_is_trainer: number;
}

// GET /api/posts?circle=<id>&cursor=... — paginated posts + reactions summary + comment count
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const circle = searchParams.get("circle");
  const cursor = searchParams.get("cursor"); // ISO created_at cursor
  const limit = 20;

  const db = getDb();
  const base = `
    SELECT p.id, p.author_id, p.body, p.photo_url, p.milestone_type, p.crosspost_fb, p.crosspost_linkedin,
           p.crosspost_fb_status, p.crosspost_li_status, p.circle_id, p.created_at,
           u.first_name as author_first_name, u.avatar_url as author_avatar_url, u.is_verified_trainer as author_is_trainer
    FROM posts p JOIN users u ON u.id = p.author_id
  `;
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  if (circle) {
    conditions.push("p.circle_id = ?");
    params.push(circle);
  }
  if (cursor) {
    conditions.push("p.created_at < ?");
    params.push(cursor);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = (await db.prepare(`${base} ${where} ORDER BY p.created_at DESC LIMIT ?`).all(...params, limit)) as unknown as PostRow[];

  const posts = await Promise.all(
    rows.map(async (r) => {
      const reactions = (await db
        .prepare(`SELECT kind, COUNT(*) as c FROM reactions WHERE post_id = ? GROUP BY kind`)
        .all(r.id)) as { kind: string; c: number }[];
      const commentCount = ((await db.prepare(`SELECT COUNT(*) as c FROM comments WHERE post_id = ?`).get(r.id)) as { c: number }).c;
      const namedReactors = (await db
        .prepare(
          `SELECT u.first_name, rx.kind FROM reactions rx JOIN users u ON u.id = rx.user_id WHERE rx.post_id = ? ORDER BY rx.created_at DESC LIMIT 2`
        )
        .all(r.id)) as { first_name: string; kind: string }[];
      const myReaction = (await db
        .prepare(`SELECT kind FROM reactions WHERE post_id = ? AND user_id = ?`)
        .get(r.id, user.id)) as { kind: string } | undefined;

      return {
        id: r.id,
        author: { id: r.author_id, firstName: r.author_first_name, avatarUrl: r.author_avatar_url, isVerifiedTrainer: !!r.author_is_trainer },
        body: r.body,
        photoUrl: r.photo_url,
        milestoneType: r.milestone_type,
        crosspostFb: !!r.crosspost_fb,
        crosspostLinkedin: !!r.crosspost_linkedin,
        crosspostFbStatus: r.crosspost_fb_status,
        crosspostLiStatus: r.crosspost_li_status,
        circleId: r.circle_id,
        createdAt: r.created_at,
        reactions: { cheer: 0, hold: 0, celebrate: 0, ...Object.fromEntries(reactions.map((x) => [x.kind, x.c])) },
        reactionTotal: reactions.reduce((s, x) => s + x.c, 0),
        namedReactors,
        myReaction: myReaction?.kind ?? null,
        commentCount,
      };
    })
  );

  const nextCursor = rows.length === limit ? rows[rows.length - 1].created_at : null;
  return Response.json({ posts, nextCursor });
}

// POST /api/posts — body + milestone + attachment + crosspost target flags
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { text, photoUrl, milestoneType, crosspostFb, crosspostLinkedin, circleId, milestoneAmount } = (body || {}) as {
    text?: string;
    photoUrl?: string | null;
    milestoneType?: string;
    crosspostFb?: boolean;
    crosspostLinkedin?: boolean;
    circleId?: string | null;
    milestoneAmount?: number | null;
  };

  if (!text || !text.trim()) {
    return Response.json({ code: "BAD_REQUEST", message: "Post body cannot be empty." }, { status: 400 });
  }
  const validMilestones = ["first_income", "week_complete", "new_skill", "none"];
  const mType = validMilestones.includes(milestoneType || "") ? milestoneType! : "none";

  const db = getDb();
  const postId = newId("post");

  let crosspostCopy: string | null = null;
  if (crosspostFb || crosspostLinkedin) {
    const gen = generateCrosspostCopy(text, mType);
    if (gen.blocked) {
      return Response.json(
        { code: "CROSSPOST_COPY_BLOCKED", message: `Cross-post copy could not reference program history. Blocked terms: ${gen.blockedWords.join(", ")}` },
        { status: 400 }
      );
    }
    crosspostCopy = gen.copy;
  }

  await db.prepare(
    `INSERT INTO posts (id, author_id, body, photo_url, milestone_type, crosspost_fb, crosspost_linkedin, crosspost_copy,
       crosspost_fb_status, crosspost_li_status, circle_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`
  ).run(
    postId, user.id, text.trim(), photoUrl || null, mType,
    crosspostFb ? 1 : 0, crosspostLinkedin ? 1 : 0, crosspostCopy,
    crosspostFb ? "queued" : "idle", crosspostLinkedin ? "queued" : "idle",
    circleId || null
  );

  if (mType !== "none") {
    await db.prepare(
      `INSERT INTO milestones (id, user_id, post_id, type, amount, story) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(newId("ms"), user.id, postId, mType, milestoneAmount ?? null, text.trim());
  }

  // Cross-post queued with 30s undo window per spec 6.10 — handled by the
  // /api/crosspost/[provider]/send endpoint being called by a client timer
  // after 30s, OR the /api/crosspost/[provider]/undo endpoint if the user
  // taps undo within that window. We don't auto-send synchronously here.
  void facebookProvider;
  void linkedinProvider;
  void FEATURE_CROSSPOST_LIVE;

  return Response.json({ ok: true, postId, crosspostCopy });
}
