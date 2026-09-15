import { NextRequest } from "next/server";
import { getDb, newId } from "@/lib/db";
import { smsProvider, generateOtp } from "@/lib/sms";

// POST /api/auth/resend-otp — 24-second resend timer enforced client-side (screen 04)
export async function POST(req: NextRequest) {
  const { identifier } = (await req.json().catch(() => ({}))) as { identifier?: string };
  if (!identifier) return Response.json({ code: "BAD_REQUEST", message: "Missing identifier." }, { status: 400 });

  const db = getDb();
  const code = generateOtp();
  db.prepare(
    `INSERT INTO otp_codes (id, destination, code, purpose, expires_at)
     VALUES (?, ?, ?, 'signup', datetime('now', '+10 minutes'))`
  ).run(newId("otp"), identifier, code);
  await smsProvider.sendOtp(identifier, code);

  return Response.json({ ok: true, devOtp: process.env.NODE_ENV !== "production" ? code : undefined });
}
