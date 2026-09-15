import { NextRequest } from "next/server";
import { getDb, newId } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { smsProvider, generateOtp } from "@/lib/sms";

// POST /api/auth/signup — phone or email + password + T&C consent (screen 03)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ code: "BAD_REQUEST", message: "Invalid body." }, { status: 400 });

  const { identifier, password, acceptedTerms } = body as {
    identifier?: string;
    password?: string;
    acceptedTerms?: boolean;
  };

  if (!identifier || !password) {
    return Response.json({ code: "BAD_REQUEST", message: "Phone/email and password are required." }, { status: 400 });
  }
  if (!acceptedTerms) {
    return Response.json({ code: "CONSENT_REQUIRED", message: "You must accept the terms to continue." }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ code: "WEAK_PASSWORD", message: "Password must be at least 6 characters." }, { status: 400 });
  }

  const isEmail = identifier.includes("@");
  const db = getDb();

  const existing = db
    .prepare(`SELECT id FROM users WHERE ${isEmail ? "email" : "phone"} = ?`)
    .get(identifier) as { id: string } | undefined;

  let userId: string;
  if (existing) {
    userId = existing.id;
    db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(hashPassword(password), userId);
  } else {
    userId = newId("usr");
    db.prepare(
      `INSERT INTO users (id, role, first_name, phone, email, password_hash, onboarding_complete)
       VALUES (?, 'participant', 'New Member', ?, ?, ?, 0)`
    ).run(userId, isEmail ? null : identifier, isEmail ? identifier : null, hashPassword(password));
  }

  const code = generateOtp();
  db.prepare(
    `INSERT INTO otp_codes (id, destination, code, purpose, expires_at)
     VALUES (?, ?, ?, 'signup', datetime('now', '+10 minutes'))`
  ).run(newId("otp"), identifier, code);

  await smsProvider.sendOtp(identifier, code);

  return Response.json({ ok: true, userId, identifier, devOtp: process.env.NODE_ENV !== "production" ? code : undefined });
}
