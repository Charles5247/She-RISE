import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  await db.prepare(`INSERT INTO circle_members (circle_id, user_id) VALUES (?, ?) ON CONFLICT (circle_id, user_id) DO NOTHING`).run(id, user.id);
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  await db.prepare(`DELETE FROM circle_members WHERE circle_id = ? AND user_id = ?`).run(id, user.id);
  return Response.json({ ok: true });
}
