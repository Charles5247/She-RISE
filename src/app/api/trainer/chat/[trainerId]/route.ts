import { getDb, newId } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";
const handle = withErrorHandling(
  async (
    req: Request,
    {
      params,
    }: {
      params: Promise<{
        trainerId: string;
      }>;
    },
  ) => {
    const user = await requireRole("trainer", "participant");
    if (user instanceof Response) return user;
    const { trainerId } = await params;
    const payload =
      req.method === "POST" ? await req.json().catch(() => null) : null;
    const participantId =
      user.role === "trainer"
        ? req.method === "POST"
          ? payload?.participantId
          : new URL(req.url).searchParams.get("participantId")
        : user.id;
    if (typeof participantId !== "string" || !participantId)
      return Response.json(
        { message: "Participant ID required." },
        { status: 400 },
      );
    if (user.role === "trainer" && trainerId !== user.id)
      return Response.json(
        { message: "This conversation is not yours." },
        { status: 403 },
      );
    const db = getDb();
    const assignment = await db
      .prepare(
        "SELECT r.id FROM trainer_assignments r JOIN users t ON t.id = r.trainer_id AND t.role = 'trainer' JOIN users p ON p.id = r.participant_id AND p.role = 'participant' WHERE r.trainer_id = ? AND r.participant_id = ? AND r.unassigned_at IS NULL",
      )
      .get(trainerId, participantId);
    if (!assignment)
      return Response.json(
        { message: "No active trainer assignment for this conversation." },
        { status: 403 },
      );
    if (req.method === "GET") {
      const messages = await db
        .prepare(
          "SELECT id, sender_id, body, created_at FROM dm_messages WHERE trainer_id = ? AND participant_id = ? ORDER BY created_at, id",
        )
        .all(trainerId, participantId);
      const partner = await db
        .prepare("SELECT first_name FROM users WHERE id = ?")
        .get(user.role === "trainer" ? participantId : trainerId);
      return Response.json({ messages, partnerName: partner?.first_name });
    }
    if (
      typeof payload?.body !== "string" ||
      !payload.body.trim() ||
      payload.body.length > 5000
    )
      return Response.json(
        { message: "Enter a message of 1?5000 characters." },
        { status: 400 },
      );
    const id = newId("dm");
    await db.transaction(async (tx) => {
      await tx
        .prepare(
          "INSERT INTO dm_messages (id, trainer_id, participant_id, sender_id, body) VALUES (?, ?, ?, ?, ?)",
        )
        .run(id, trainerId, participantId, user.id, payload.body.trim());
      await tx
        .prepare(
          "INSERT INTO notifications (id, user_id, kind, actor_id, body) VALUES (?, ?, 'trainer_message', ?, ?)",
        )
        .run(
          newId("ntf"),
          user.role === "trainer" ? participantId : trainerId,
          user.id,
          user.first_name + " sent you a message",
        );
    })();
    return Response.json({ ok: true, id });
  },
);
export { handle as GET, handle as POST };
