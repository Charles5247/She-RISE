import { getDb, newId } from "@/lib/db";
import { requireRole } from "@/lib/auth";
const configs = {
  trainer: {
    table: "trainer_assignments",
    owner: "trainer_id",
    ended: "unassigned_at",
  },
  sponsor: {
    table: "sponsor_sponsorships",
    owner: "sponsor_id",
    ended: "ended_at",
  },
} as const;
export async function manageRelationship(
  req: Request,
  role: keyof typeof configs,
  ownerId: string,
) {
  const actor = await requireRole("admin");
  if (actor instanceof Response) return actor;
  const db = getDb();
  const c = configs[role];
  const owner = await db
    .prepare("SELECT id FROM users WHERE id = ? AND role = ?")
    .get(ownerId, role);
  if (!owner)
    return Response.json({ message: "Account not found." }, { status: 404 });
  if (req.method === "GET") {
    const participants = await db
      .prepare(
        `SELECT u.id, u.first_name, u.lga, u.skill_category FROM ${c.table} r JOIN users u ON u.id = r.participant_id WHERE r.${c.owner} = ? AND r.${c.ended} IS NULL ORDER BY u.first_name, u.id`,
      )
      .all(ownerId);
    return Response.json({ participants });
  }
  const body =
    req.method === "POST" ? await req.json().catch(() => null) : null;
  const participantId =
    req.method === "DELETE"
      ? new URL(req.url).searchParams.get("participantId")
      : body?.participantId;
  if (typeof participantId !== "string" || !participantId.trim())
    return Response.json(
      { message: "Participant ID required." },
      { status: 400 },
    );
  const participant = await db
    .prepare("SELECT id FROM users WHERE id = ? AND role = 'participant'")
    .get(participantId);
  if (!participant)
    return Response.json(
      { message: "Participant not found." },
      { status: 404 },
    );
  if (req.method === "DELETE") {
    await db
      .prepare(
        `UPDATE ${c.table} SET ${c.ended} = NOW() WHERE ${c.owner} = ? AND participant_id = ? AND ${c.ended} IS NULL`,
      )
      .run(ownerId, participantId);
  } else {
    await db
      .prepare(
        `INSERT INTO ${c.table} (id, ${c.owner}, participant_id${role === "trainer" ? ", assigned_by" : ""}) VALUES (?, ?, ?${role === "trainer" ? ", ?" : ""}) ON CONFLICT (${c.owner}, participant_id) WHERE ${c.ended} IS NULL DO NOTHING`,
      )
      .run(
        newId("rel"),
        ownerId,
        participantId,
        ...(role === "trainer" ? [actor.id] : []),
      );
  }
  return Response.json({ ok: true });
}
