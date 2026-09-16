import { getDb, newId } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { smsProvider } from "@/lib/sms";

// GET/POST /api/admin/broadcasts — SMS-fallback broadcasts (screen 31)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  if (!["admin", "trainer"].includes(user.role)) return Response.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });

  const db = getDb();
  const broadcasts = await db.prepare(`SELECT * FROM broadcasts ORDER BY sent_at DESC LIMIT 20`).all();
  return Response.json({ broadcasts });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  if (!["admin", "trainer"].includes(user.role)) return Response.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });

  const { audienceFilter, title, body } = (await req.json().catch(() => ({}))) as {
    audienceFilter?: string;
    title?: string;
    body?: string;
  };
  if (!title || !body) return Response.json({ code: "BAD_REQUEST", message: "Title and body are required." }, { status: 400 });

  const db = getDb();
  let query = `SELECT phone FROM users WHERE role = 'participant' AND phone IS NOT NULL`;
  const params: string[] = [];
  if (audienceFilter && audienceFilter !== "all") {
    query += " AND (lga = ? OR skill_category = ?)";
    params.push(audienceFilter, audienceFilter);
  }
  const recipients = ((await db.prepare(query).all(...params)) as { phone: string }[]).map((r) => r.phone);

  const result = await smsProvider.sendBroadcast(recipients, title, body);

  const id = newId("bc");
  await db.prepare(
    `INSERT INTO broadcasts (id, sender_id, audience_filter, title, body, reach_count, open_count) VALUES (?, ?, ?, ?, ?, ?, 0)`
  ).run(id, user.id, audienceFilter || "all", title, body, result.reach);

  return Response.json({ ok: true, id, reach: result.reach });
}
