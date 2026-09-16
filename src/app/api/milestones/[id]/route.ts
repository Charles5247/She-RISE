import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/milestones/{id} — milestone detail (screen 18): amount + verifier + story
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const { id } = await params;

  const db = getDb();
  const milestone = (await db
    .prepare(
      `SELECT m.*, u.first_name as verifier_first_name, u.is_verified_trainer as verifier_is_trainer
       FROM milestones m LEFT JOIN users u ON u.id = m.verifier_id WHERE m.id = ?`
    )
    .get(id)) as Record<string, unknown> | undefined;

  if (!milestone) return Response.json({ code: "NOT_FOUND", message: "Milestone not found." }, { status: 404 });

  return Response.json({
    milestone: {
      id: milestone.id,
      type: milestone.type,
      amount: milestone.amount,
      story: milestone.story,
      createdAt: milestone.created_at,
      verifier: milestone.verifier_id
        ? { firstName: milestone.verifier_first_name, isVerifiedTrainer: !!milestone.verifier_is_trainer }
        : null,
    },
  });
}
