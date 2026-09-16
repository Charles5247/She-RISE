import { getSessionUser } from "@/lib/auth";
import { withExportAudit } from "@/lib/access";

// POST /admin/exports — requires `purpose` in the body; writes export_audit_log
// BEFORE returning the file. Per spec: "the write is transactional with the
// read — if the audit write fails, the export must fail too."
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  if (user.role !== "admin") return Response.json({ code: "FORBIDDEN", message: "Admin only." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const { reportId, purpose, fields } = (body || {}) as { reportId?: string; purpose?: string; fields?: string[] };

  if (!reportId) return Response.json({ code: "BAD_REQUEST", message: "reportId required." }, { status: 400 });
  if (!purpose || !purpose.trim()) {
    return Response.json({ code: "PURPOSE_REQUIRED", message: "You must document a purpose before exporting." }, { status: 400 });
  }

  try {
    const data = await withExportAudit(user.id, reportId, purpose, async (db) => {
      switch (reportId) {
        case "reach_retention": {
          return db.prepare(`SELECT lga, COUNT(*) as participants, AVG(streak_count) as avg_streak FROM users WHERE role = 'participant' GROUP BY lga`).all();
        }
        case "first_income": {
          return db
            .prepare(
              `SELECT u.first_name, u.lga, m.amount, m.created_at FROM milestones m JOIN users u ON u.id = m.user_id WHERE m.type = 'first_income' ORDER BY m.created_at DESC`
            )
            .all();
        }
        case "referral_funnel": {
          return db.prepare(`SELECT stage, drop_off_reason, lga, created_at FROM referrals`).all();
        }
        case "perception_summary": {
          return db.prepare(`SELECT lga, survey_wave, answers FROM survey_responses`).all();
        }
        case "training_completion": {
          return db
            .prepare(
              `SELECT p.title as pathway, COUNT(lp.lesson_id) as completions FROM lesson_progress lp
               JOIN lessons l ON l.id = lp.lesson_id JOIN pathways p ON p.id = l.pathway_id
               WHERE lp.status = 'done' GROUP BY p.title`
            )
            .all();
        }
        case "custom": {
          // field-checkbox custom export builder — returns a flat participant table
          // limited to the fields the admin selected.
          const allowed = new Set(["first_name", "lga", "skill_category", "xp_total", "streak_count", "created_at"]);
          const cols = (fields || []).filter((f) => allowed.has(f));
          const selectCols = cols.length ? cols.join(", ") : "first_name, lga";
          return db.prepare(`SELECT ${selectCols} FROM users WHERE role = 'participant'`).all();
        }
        default:
          throw new Error("UNKNOWN_REPORT");
      }
    });
    return Response.json({ ok: true, reportId, rowCount: Array.isArray(data) ? data.length : 0, data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Export failed.";
    if (msg === "EXPORT_PURPOSE_REQUIRED") {
      return Response.json({ code: "PURPOSE_REQUIRED", message: "You must document a purpose before exporting." }, { status: 400 });
    }
    return Response.json({ code: "EXPORT_FAILED", message: msg }, { status: 500 });
  }
}
