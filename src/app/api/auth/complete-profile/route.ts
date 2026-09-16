import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// POST /api/auth/complete-profile — screens 05 & 06
// first_name (public), last_name (private), age, LGA, avatar; then language + skill.
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { firstName, lastName, age, lga, avatarUrl, language, skillCategory } = (body || {}) as {
    firstName?: string;
    lastName?: string;
    age?: number;
    lga?: string;
    avatarUrl?: string;
    language?: string;
    skillCategory?: string;
  };

  if (!firstName || !lga) {
    return Response.json({ code: "BAD_REQUEST", message: "First name and LGA are required." }, { status: 400 });
  }

  const db = getDb();
  await db.prepare(
    `UPDATE users SET first_name = ?, last_name = ?, age = ?, lga = ?, avatar_url = ?,
       language = COALESCE(?, language), skill_category = COALESCE(?, skill_category),
       onboarding_complete = 1, updated_at = NOW()
     WHERE id = ?`
  ).run(firstName, lastName || null, age || null, lga, avatarUrl || null, language || null, skillCategory || null, user.id);

  return Response.json({ ok: true });
}
