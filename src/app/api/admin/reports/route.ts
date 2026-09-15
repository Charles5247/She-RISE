import { getSessionUser } from "@/lib/auth";

// GET /api/admin/reports — standard reports list (screen 30)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  if (user.role !== "admin") return Response.json({ code: "FORBIDDEN", message: "Admin only." }, { status: 403 });

  const STANDARD_REPORTS = [
    { id: "reach_retention", name: "Reach & Retention Summary", description: "Total participants, active streaks, LGA coverage." },
    { id: "first_income", name: "First Income Report", description: "All verified first-income milestones and amounts." },
    { id: "referral_funnel", name: "Referral Funnel Report", description: "Referred → Screened → Eligible → Enrolled with drop-off reasons." },
    { id: "perception_summary", name: "Community Perception Summary", description: "Stigma, acceptance, and readiness findings by LGA." },
    { id: "training_completion", name: "Training Completion Report", description: "Pathway and lesson completion rates by cohort." },
  ];

  return Response.json({ reports: STANDARD_REPORTS });
}
