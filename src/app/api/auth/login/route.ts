import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

// POST /api/auth/login — screen 07. Accepts a roleHint for the
// "Trainer login" sub-CTA which routes into the same login with a role hint;
// we don't hard-restrict on it (a trainer's credentials work regardless) —
// it's purely a UX affordance per spec, so we just echo the resolved role back.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { identifier, password } = (body || {}) as { identifier?: string; password?: string };
  if (!identifier || !password) {
    return Response.json({ code: "BAD_REQUEST", message: "Identifier and password required." }, { status: 400 });
  }

  const isEmail = identifier.includes("@");
  const db = getDb();
  const user = db
    .prepare(`SELECT id, role, password_hash, onboarding_complete FROM users WHERE ${isEmail ? "email" : "phone"} = ?`)
    .get(identifier) as { id: string; role: string; password_hash: string; onboarding_complete: number } | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return Response.json({ code: "INVALID_CREDENTIALS", message: "Incorrect phone/email or password." }, { status: 401 });
  }

  await createSession(user.id);
  return Response.json({ ok: true, role: user.role, onboardingComplete: !!user.onboarding_complete });
}
