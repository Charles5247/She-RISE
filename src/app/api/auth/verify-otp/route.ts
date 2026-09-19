import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";

// POST /api/auth/verify-otp — screen 04, 6-digit OTP
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  const { identifier, code } = (body || {}) as { identifier?: string; code?: string };
  if (!identifier || !code) {
    return Response.json({ code: "BAD_REQUEST", message: "Missing identifier or code." }, { status: 400 });
  }

  const db = getDb();
  const otp = (await db
    .prepare(
      `SELECT * FROM otp_codes WHERE destination = ? AND code = ? AND consumed = 0 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`
    )
    .get(identifier, code)) as { id: string } | undefined;

  if (!otp) {
    return Response.json({ code: "INVALID_OTP", message: "That code is incorrect or has expired." }, { status: 400 });
  }

  await db.prepare(`UPDATE otp_codes SET consumed = 1 WHERE id = ?`).run(otp.id);

  const isEmail = identifier.includes("@");
  const user = (await db
    .prepare(`SELECT id, onboarding_complete FROM users WHERE ${isEmail ? "email" : "phone"} = ?`)
    .get(identifier)) as { id: string; onboarding_complete: number } | undefined;

  if (!user) {
    return Response.json({ code: "NOT_FOUND", message: "Account not found." }, { status: 404 });
  }

  await createSession(user.id);
  return Response.json({ ok: true, onboardingComplete: !!user.onboarding_complete });
});
