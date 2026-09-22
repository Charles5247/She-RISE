import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/me/profile — My profile (screen 19)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });

  const db = getDb();
  const row = (await db
    .prepare(
      `SELECT first_name, last_name, bio, lga, avatar_url, xp_total, streak_count, crosspost_fb_connected, crosspost_li_connected
       FROM users WHERE id = ?`
    )
    .get(user.id)) as Record<string, unknown>;
  const medalsEarned = ((await db.prepare(`SELECT COUNT(*) as c FROM medals WHERE user_id = ?`).get(user.id)) as { c: number }).c;

  return Response.json({
    profile: {
      firstName: row.first_name,
      // last_name IS included: this is the participant reading her OWN
      // record. Never expose this field for any OTHER user's profile read.
      lastName: row.last_name,
      bio: row.bio,
      lga: row.lga,
      avatarUrl: row.avatar_url,
      xpTotal: row.xp_total,
      streakCount: row.streak_count,
      medalsEarned,
      fbConnected: !!row.crosspost_fb_connected,
      liConnected: !!row.crosspost_li_connected,
    },
  });
}

// PATCH /api/me/profile — edit profile (screen 20)
export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { firstName, lastName, bio, lga, avatarUrl } = body as {
    firstName?: string;
    lastName?: string;
    bio?: string;
    lga?: string;
    avatarUrl?: string;
  };
  if (avatarUrl !== undefined && avatarUrl !== null && !avatarUrl.startsWith("data:image/")) {
    return Response.json({ code: "BAD_REQUEST", message: "Profile photo must be an image." }, { status: 400 });
  }

  const db = getDb();
  const hasAvatarUrl = Object.hasOwn(body as object, "avatarUrl");
  await db.prepare(
    `UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name),
       bio = COALESCE(?, bio), lga = COALESCE(?, lga),
       avatar_url = CASE WHEN ? THEN ? ELSE avatar_url END,
       updated_at = NOW()
     WHERE id = ?`
  ).run(firstName ?? null, lastName ?? null, bio ?? null, lga ?? null, hasAvatarUrl ? 1 : 0, avatarUrl ?? null, user.id);
  return Response.json({ ok: true });
}
