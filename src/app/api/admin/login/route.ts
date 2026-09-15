import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

// POST /api/admin/login — screen 24. Split-screen "Every rise, on record" /
// "All access is audited." Only admin, trainer, and sponsor roles may sign in
// here — participants are rejected even with correct credentials, since the
// admin surface is deployed to a separate domain per the user's requirement.
export async function POST(req: NextRequest) {
  const { identifier, password } = (await req.json().catch(() => ({}))) as { identifier?: string; password?: string };
  if (!identifier || !password) {
    return Response.json({ code: "BAD_REQUEST", message: "Email and password required." }, { status: 400 });
  }
  const isEmail = identifier.includes("@");
  const db = getDb();
  const user = db
    .prepare(`SELECT id, role, password_hash FROM users WHERE ${isEmail ? "email" : "phone"} = ?`)
    .get(identifier) as { id: string; role: string; password_hash: string } | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return Response.json({ code: "INVALID_CREDENTIALS", message: "Incorrect email or password." }, { status: 401 });
  }
  if (!["admin", "trainer", "sponsor"].includes(user.role)) {
    return Response.json({ code: "FORBIDDEN", message: "This portal is for staff, trainers, and sponsors only." }, { status: 403 });
  }

  await createSession(user.id);
  return Response.json({ ok: true, role: user.role });
}
