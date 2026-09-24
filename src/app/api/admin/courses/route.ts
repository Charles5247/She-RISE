import { getDb, newId } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";

export const POST = withErrorHandling(async (req: Request) => {
  const user = await getSessionUser();
  if (!user) return Response.json({ message: "Sign in required." }, { status: 401 });
  if (user.role !== "admin") return Response.json({ message: "Admin access required." }, { status: 403 });
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const category = typeof body.skillCategory === "string" ? body.skillCategory.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!title || !category) return Response.json({ message: "Course title and skill category are required." }, { status: 400 });
  const db = getDb();
  const order = await db.prepare(`SELECT COALESCE(MAX(order_index), -1) + 1 AS next FROM pathways`).get() as { next: number };
  const id = newId("path");
  await db.prepare(`INSERT INTO pathways (id, title, skill_category, description, order_index) VALUES (?, ?, ?, ?, ?)`)
    .run(id, title, category, description || null, order.next);
  return Response.json({ ok: true, id }, { status: 201 });
});

export const PATCH = withErrorHandling(async (req: Request) => {
  const user = await getSessionUser();
  if (!user) return Response.json({ message: "Sign in required." }, { status: 401 });
  if (user.role !== "admin") return Response.json({ message: "Admin access required." }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ message: "Course ID is required." }, { status: 400 });
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const category = typeof body.skillCategory === "string" ? body.skillCategory.trim() : "";
  if (!title || !category) return Response.json({ message: "Course title and skill category are required." }, { status: 400 });
  await getDb().prepare(`UPDATE pathways SET title = ?, skill_category = ?, description = ? WHERE id = ?`)
    .run(title, category, typeof body.description === "string" ? body.description.trim() || null : null, id);
  return Response.json({ ok: true });
});

export const DELETE = withErrorHandling(async (req: Request) => {
  const user = await getSessionUser();
  if (!user) return Response.json({ message: "Sign in required." }, { status: 401 });
  if (user.role !== "admin") return Response.json({ message: "Admin access required." }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ message: "Course ID is required." }, { status: 400 });
  await getDb().prepare(`DELETE FROM pathways WHERE id = ?`).run(id);
  return Response.json({ ok: true });
});
