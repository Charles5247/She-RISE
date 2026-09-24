import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";

// POST /api/auth/complete-profile — screens 05 & 06
// first_name (public), last_name (private), age, LGA, avatar; then language + skill.
export const POST = withErrorHandling(async (req: NextRequest) => {
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
  if (avatarUrl !== undefined && avatarUrl !== null && !avatarUrl.startsWith("data:image/")) {
    return Response.json({ code: "BAD_REQUEST", message: "Profile photo must be an image." }, { status: 400 });
  }

  const db = getDb();
  const hasAvatarUrl = Object.hasOwn(body as object, "avatarUrl");
  const profileFields = `first_name = ?, last_name = ?, age = ?, lga = ?,
       language = COALESCE(?, language), skill_category = COALESCE(?, skill_category),
       onboarding_complete = 1, updated_at = NOW()`;
  if (hasAvatarUrl) {
    await db.prepare(
      `UPDATE users SET ${profileFields}, avatar_url = ? WHERE id = ?`
    ).run(firstName, lastName || null, age || null, lga, language || null, skillCategory || null, avatarUrl ?? null, user.id);
  } else {
    await db.prepare(
      `UPDATE users SET ${profileFields} WHERE id = ?`
    ).run(firstName, lastName || null, age || null, lga, language || null, skillCategory || null, user.id);
  }

  return Response.json({ ok: true });
});
