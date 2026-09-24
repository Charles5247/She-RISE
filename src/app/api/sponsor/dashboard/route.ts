import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ message: "Sign in required." }, { status: 401 });
  if (user.role !== "sponsor") return Response.json({ message: "Sponsor access required." }, { status: 403 });
  const db = getDb();
  const sponsorship = await db.prepare(`SELECT women_sponsored_count, sponsor_since_year FROM sponsor_profiles WHERE user_id = ?`).get(user.id) as { women_sponsored_count: number; sponsor_since_year: number } | undefined;
  const stats = await db.prepare(`SELECT (SELECT COUNT(*) FROM users WHERE role = 'participant') AS participants, (SELECT COUNT(*) FROM pathways) AS courses`).get() as { participants: number; courses: number };
  return Response.json({ womenSponsored: sponsorship?.women_sponsored_count ?? 0, sinceYear: sponsorship?.sponsor_since_year ?? null, participants: stats.participants, courses: stats.courses });
}
