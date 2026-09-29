import { getDb, newId } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";

export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireRole("admin", "trainer");
  if (user instanceof Response) return user;
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const instructions = typeof body?.instructions === "string" ? body.instructions.trim() : "";
  const dueDate = body?.dueDate || null;
  if (typeof body?.participantId !== "string" || !title || title.length > 150 || !instructions || instructions.length > 5000 ||
    (dueDate !== null && (typeof dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || !Number.isFinite(Date.parse(dueDate)) || new Date(dueDate).toISOString().slice(0, 10) !== dueDate))) {
    return Response.json({ message: "Enter a participant, title, instructions, and a valid optional due date." }, { status: 400 });
  }
  const db = getDb();
  return db.transaction(async tx => {
    const participant = await tx.prepare("SELECT id FROM users WHERE id = ? AND role = 'participant'").get(body.participantId);
    if (!participant) return Response.json({ message: "Participant not found." }, { status: 404 });
    if (user.role === "trainer" && !await tx.prepare("SELECT id FROM trainer_assignments WHERE trainer_id = ? AND participant_id = ? AND unassigned_at IS NULL FOR SHARE").get(user.id, body.participantId)) {
      return Response.json({ message: "You can send assignments only to your assigned participants." }, { status: 403 });
    }
    const id = newId("task");
    await tx.prepare("INSERT INTO learning_assignments (id, participant_id, assigned_by, title, instructions, due_date) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, body.participantId, user.id, title, instructions, dueDate);
    await tx.prepare("INSERT INTO notifications (id, user_id, kind, actor_id, body, href) VALUES (?, ?, 'assignment', ?, ?, ?)")
      .run(newId("ntf"), body.participantId, user.id, `${user.first_name} sent you an assignment: ${title}`, `/dashboard#assignment-${id}`);
    return Response.json({ ok: true, id }, { status: 201 });
  })();
});
