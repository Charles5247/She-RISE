import { getDb, newId } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// POST /api/admin/participants/{id}/notes — trainer writes a private note.
// Per spec: "trainer scope is read-only except for trainer_notes on their own
// participants" (Section 10). Admins may also write for oversight purposes.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  if (user.role !== "trainer" && user.role !== "admin") {
    return Response.json({ code: "FORBIDDEN", message: "Only trainers or admins may write notes." }, { status: 403 });
  }
  const { id } = await params;
  const { body, trainerId } = (await req.json().catch(() => ({}))) as { body?: string; trainerId?: string };
  if (!body || !body.trim()) return Response.json({ code: "BAD_REQUEST", message: "Note cannot be empty." }, { status: 400 });

  const effectiveTrainerId = user.role === "trainer" ? user.id : trainerId;
  if (!effectiveTrainerId) return Response.json({ code: "BAD_REQUEST", message: "trainerId required for admin-authored notes." }, { status: 400 });

  const db = getDb();
  const noteId = newId("tn");
  await db.prepare(`INSERT INTO trainer_notes (id, trainer_id, participant_id, body) VALUES (?, ?, ?, ?)`).run(
    noteId,
    effectiveTrainerId,
    id,
    body.trim()
  );
  return Response.json({ ok: true, noteId });
}
