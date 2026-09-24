import { getDb, newId } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";

// POST /api/admin/participants/{id}/notes — trainer writes a private note.
// Per spec: "trainer scope is read-only except for trainer_notes on their own
// participants" (Section 10). Admins may also write for oversight purposes.
export const POST = withErrorHandling(async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  if (user.role !== "trainer" && user.role !== "admin") {
    return Response.json({ code: "FORBIDDEN", message: "Only trainers or admins may write notes." }, { status: 403 });
  }
  const { id } = await params;
  const { body, trainerId } = ((await req.json().catch(() => null)) ?? {}) as { body?: string; trainerId?: string };
  if (typeof body !== "string" || !body.trim() || body.length > 5000) return Response.json({ code: "BAD_REQUEST", message: "Enter a note of 1-5000 characters." }, { status: 400 });

  const effectiveTrainerId = user.role === "trainer" ? user.id : trainerId;
  if (!effectiveTrainerId) return Response.json({ code: "BAD_REQUEST", message: "trainerId required for admin-authored notes." }, { status: 400 });

  const db = getDb();
  const participant = await db.prepare("SELECT id FROM users WHERE id = ? AND role = 'participant'").get(id);
  if (!participant) return Response.json({ message: "Participant not found." }, { status: 404 });
  const trainer = await db.prepare("SELECT id FROM users WHERE id = ? AND role = 'trainer'").get(effectiveTrainerId);
  if (!trainer) return Response.json({ message: "Trainer not found." }, { status: 404 });
  if (user.role === "trainer" && !await db.prepare("SELECT id FROM trainer_assignments WHERE trainer_id = ? AND participant_id = ? AND unassigned_at IS NULL").get(user.id, id)) return Response.json({ message: "Participant is not assigned to you." }, { status: 403 });
  const noteId = newId("tn");
  await db.prepare(`INSERT INTO trainer_notes (id, trainer_id, participant_id, body) VALUES (?, ?, ?, ?)`).run(
    noteId,
    effectiveTrainerId,
    id,
    body.trim()
  );
  return Response.json({ ok: true, noteId });
});
