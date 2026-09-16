import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/trainers — participant's assigned/available trainer(s) for the chat screen
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const db = getDb();
  const trainers = (await db
    .prepare(
      `SELECT u.id, u.first_name, u.avatar_url, tp.specialty, tp.rating
       FROM users u JOIN trainer_profiles tp ON tp.user_id = u.id
       WHERE u.role = 'trainer' AND u.skill_category = (SELECT skill_category FROM users WHERE id = ?)
       LIMIT 5`
    )
    .all(user.id)) as Record<string, unknown>[];

  const fallback = trainers.length
    ? trainers
    : ((await db
        .prepare(
          `SELECT u.id, u.first_name, u.avatar_url, tp.specialty, tp.rating
           FROM users u JOIN trainer_profiles tp ON tp.user_id = u.id WHERE u.role = 'trainer' LIMIT 3`
        )
        .all()) as Record<string, unknown>[]);

  return Response.json({
    trainers: fallback.map((t) => ({
      id: t.id,
      firstName: t.first_name,
      avatarUrl: t.avatar_url,
      specialty: t.specialty,
      rating: t.rating,
    })),
  });
}
