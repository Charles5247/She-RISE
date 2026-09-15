import { NextRequest } from "next/server";
import { getDb, newId } from "@/lib/db";
import { smsProvider, generateOtp } from "@/lib/sms";

// POST /api/auth/forgot-password — screen 08.
// Per principle 2 / spec 6.8: this flow must NEVER mention program history.
// The reassurance copy lives in the UI; this endpoint only ever deals with
// identifier + reset code, nothing case-related.
export async function POST(req: NextRequest) {
  const { identifier } = (await req.json().catch(() => ({}))) as { identifier?: string };
  if (!identifier) return Response.json({ code: "BAD_REQUEST", message: "Enter your phone or email." }, { status: 400 });

  const db = getDb();
  const isEmail = identifier.includes("@");
  const user = db.prepare(`SELECT id FROM users WHERE ${isEmail ? "email" : "phone"} = ?`).get(identifier);

  // Always respond ok (don't leak account existence), but only actually send if found.
  if (user) {
    const code = generateOtp();
    db.prepare(
      `INSERT INTO otp_codes (id, destination, code, purpose, expires_at)
       VALUES (?, ?, ?, 'reset', datetime('now', '+10 minutes'))`
    ).run(newId("otp"), identifier, code);
    await smsProvider.sendOtp(identifier, code);
    return Response.json({ ok: true, devOtp: process.env.NODE_ENV !== "production" ? code : undefined });
  }
  return Response.json({ ok: true });
}
