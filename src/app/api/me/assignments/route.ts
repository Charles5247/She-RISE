import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { withErrorHandling } from "@/lib/apiError";

export const GET = withErrorHandling(async () => {
  const user = await requireRole("participant");
  if (user instanceof Response) return user;
  const assignments = await getDb().prepare(`SELECT a.id, a.title, a.instructions, a.due_date::text AS "dueDate",
    a.created_at AS "createdAt", COALESCE(u.first_name, 'SheRISE team') AS "assignedBy"
    FROM learning_assignments a LEFT JOIN users u ON u.id = a.assigned_by
    WHERE a.participant_id = ? ORDER BY a.created_at DESC`).all(user.id);
  return Response.json({ assignments });
});
