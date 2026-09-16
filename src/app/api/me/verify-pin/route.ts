import { getDb } from "@/lib/db";
import { getSessionUser, verifyPassword } from "@/lib/auth";

// POST /api/me/verify-pin — unlocks panic-hide disguise (Section 4 principle 8)
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { pin } = (await req.json().catch(() => ({}))) as { pin?: string };
  if (!pin) return Response.json({ code: "BAD_REQUEST", message: "PIN required." }, { status: 400 });

  const db = getDb();
  const row = (await db.prepare(`SELECT pin_hash FROM users WHERE id = ?`).get(user.id)) as { pin_hash: string | null };
  if (!row.pin_hash) return Response.json({ code: "NO_PIN_SET", message: "No PIN has been set." }, { status: 400 });

  const ok = verifyPassword(pin, row.pin_hash);
  if (!ok) return Response.json({ code: "INVALID_PIN", message: "Incorrect PIN." }, { status: 401 });
  return Response.json({ ok: true });
}
