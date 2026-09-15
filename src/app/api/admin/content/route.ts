import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/admin/content — content library (screen 29): lessons grid with completion metrics
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  if (!["admin", "trainer"].includes(user.role)) {
    return Response.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const pathwayId = searchParams.get("pathway");

  const db = getDb();
  let query = `
    SELECT l.id, l.title, l.duration_seconds, l.xp_value, p.title as pathway_title, p.skill_category,
           m.views, m.completion_rate
    FROM lessons l JOIN pathways p ON p.id = l.pathway_id
    LEFT JOIN content_lessons_meta m ON m.lesson_id = l.id
  `;
  const params: string[] = [];
  if (pathwayId) {
    query += " WHERE l.pathway_id = ?";
    params.push(pathwayId);
  }
  query += " ORDER BY p.order_index, l.order_index";

  const lessons = db.prepare(query).all(...params);
  const pathways = db.prepare(`SELECT id, title, skill_category FROM pathways ORDER BY order_index`).all();

  return Response.json({ lessons, pathways });
}
