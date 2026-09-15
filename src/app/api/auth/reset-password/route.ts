import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { identifier, code, newPassword } = (await req.json().catch(() => ({}))) as {
    identifier?: string;
    code?: string;
    newPassword?: string;
  };
  if (!identifier || !code || !newPassword) {
    return Response.json({ code: "BAD_REQUEST", message: "Missing fields." }, { status: 400 });
  }
  const db = getDb();
  const otp = db
    .prepare(
      `SELECT id FROM otp_codes WHERE destination = ? AND code = ? AND purpose = 'reset' AND consumed = 0 AND expires_at > datetime('now')`
    )
    .get(identifier, code) as { id: string } | undefined;
  if (!otp) return Response.json({ code: "INVALID_OTP", message: "Code is incorrect or expired." }, { status: 400 });

  db.prepare(`UPDATE otp_codes SET consumed = 1 WHERE id = ?`).run(otp.id);
  const isEmail = identifier.includes("@");
  db.prepare(`UPDATE users SET password_hash = ? WHERE ${isEmail ? "email" : "phone"} = ?`).run(
    hashPassword(newPassword),
    identifier
  );
  return Response.json({ ok: true });
}
