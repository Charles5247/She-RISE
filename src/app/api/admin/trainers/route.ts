import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/admin/trainers — trainer table + sponsor cards (screen 32)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  if (!["admin", "trainer", "sponsor"].includes(user.role)) return Response.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });

  const db = getDb();
  const trainers = await db
    .prepare(
      `SELECT u.id, u.first_name, u.last_name, u.lga, tp.specialty, tp.rating,
        (SELECT COUNT(*) FROM trainer_notes tn WHERE tn.trainer_id = u.id) as notes_written
       FROM users u JOIN trainer_profiles tp ON tp.user_id = u.id WHERE u.role = 'trainer'`
    )
    .all();
  const sponsors = await db
    .prepare(
      `SELECT u.id, u.first_name, u.last_name, sp.women_sponsored_count, sp.sponsor_since_year
       FROM users u JOIN sponsor_profiles sp ON sp.user_id = u.id WHERE u.role = 'sponsor'`
    )
    .all();

  return Response.json({ trainers, sponsors });
}
