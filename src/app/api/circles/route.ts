import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/circles — circles directory (screen 13)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });

  const db = getDb();
  const circles = db
    .prepare(
      `SELECT c.*, COUNT(cm.user_id) as member_count,
        EXISTS(SELECT 1 FROM circle_members m WHERE m.circle_id = c.id AND m.user_id = ?) as joined
       FROM circles c LEFT JOIN circle_members cm ON cm.circle_id = c.id
       GROUP BY c.id ORDER BY member_count DESC`
    )
    .all(user.id) as Record<string, unknown>[];

  return Response.json({
    circles: circles.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      lga: c.lga,
      memberCount: c.member_count,
      joined: !!c.joined,
    })),
  });
}
