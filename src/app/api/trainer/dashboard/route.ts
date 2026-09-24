import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ message: "Sign in required." }, { status: 401 });
  if (user.role !== "trainer") return Response.json({ message: "Trainer access required." }, { status: 403 });
  const db = getDb();
  const profile = await db.prepare(`SELECT specialty, rating FROM trainer_profiles WHERE user_id = ?`).get(user.id) as { specialty: string | null; rating: number } | undefined;
  const stats = await db.prepare(`SELECT COUNT(DISTINCT participant_id) AS learners, COUNT(*) AS notes FROM trainer_notes WHERE trainer_id = ?`).get(user.id) as { learners: number; notes: number };
  return Response.json({ specialty: profile?.specialty ?? null, rating: profile?.rating ?? null, learners: stats.learners, notes: stats.notes });
}
