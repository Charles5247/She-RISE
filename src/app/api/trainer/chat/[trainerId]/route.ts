import { getDb, newId } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET/POST /api/trainer/chat/{trainerId} — 1:1 DM thread (screen 22)
// Works both directions: participant<->trainer. Trainer notes stay separate
// (trainer_notes table) and are NEVER surfaced here.
export async function GET(_req: Request, { params }: { params: Promise<{ trainerId: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { trainerId } = await params;

  const participantId = user.role === "trainer" ? null : user.id;
  const db = getDb();

  const messages = (await db
    .prepare(
      `SELECT * FROM dm_messages WHERE trainer_id = ? AND participant_id = ? ORDER BY created_at ASC`
    )
    .all(trainerId, participantId || trainerId)) as Record<string, unknown>[];

  return Response.json({ messages });
}

export async function POST(req: Request, { params }: { params: Promise<{ trainerId: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { trainerId } = await params;
  const { body, participantId: bodyParticipantId } = (await req.json().catch(() => ({}))) as {
    body?: string;
    participantId?: string;
  };
  if (!body || !body.trim()) return Response.json({ code: "BAD_REQUEST", message: "Message cannot be empty." }, { status: 400 });

  const participantId = user.role === "trainer" ? bodyParticipantId : user.id;
  if (!participantId) return Response.json({ code: "BAD_REQUEST", message: "participantId required." }, { status: 400 });

  const db = getDb();
  const id = newId("dm");
  await db.prepare(
    `INSERT INTO dm_messages (id, trainer_id, participant_id, sender_id, body) VALUES (?, ?, ?, ?, ?)`
  ).run(id, trainerId, participantId, user.id, body.trim());

  if (user.role !== "trainer") {
    await db.prepare(
      `INSERT INTO notifications (id, user_id, kind, actor_id, body) VALUES (?, ?, 'trainer_message', ?, ?)`
    ).run(newId("ntf"), trainerId, user.id, `${user.first_name} sent you a message`);
  } else {
    await db.prepare(
      `INSERT INTO notifications (id, user_id, kind, actor_id, body) VALUES (?, ?, 'trainer_message', ?, ?)`
    ).run(newId("ntf"), participantId, user.id, `${user.first_name} (Trainer) sent you a message`);
  }

  return Response.json({ ok: true, id });
}
