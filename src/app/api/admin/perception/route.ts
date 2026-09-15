import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canAccessEnumeratorMonitoring, canAccessSurveyResponses } from "@/lib/access";

interface Answers {
  community_acceptance?: string;
  reports_stigma?: boolean;
  discrimination_types?: string;
  main_challenge?: string;
  digital_skill_demand?: string;
  wants_counselling?: boolean;
  willing_to_support?: boolean;
  willing_to_refer?: boolean;
}

// GET /admin/perception?wave=baseline&lga=<id> — full Section 8 M&E dataset.
// admin: full access (incl. enumerator monitoring). trainer/sponsor: aggregate
// only, enumerator-monitoring block omitted per Section 9's "restrict it to
// admin role, not sponsor role" rule (trainers excluded too — they aren't
// named as eligible for this internal fieldwork-QA view).
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  if (!["admin", "trainer", "sponsor"].includes(user.role)) {
    return Response.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });
  }
  if (!canAccessSurveyResponses(user) && user.role !== "trainer" && user.role !== "sponsor") {
    return Response.json({ code: "FORBIDDEN", message: "Not permitted." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const wave = searchParams.get("wave") || "baseline";
  const lga = searchParams.get("lga");

  const db = getDb();
  let query = `SELECT * FROM survey_responses WHERE survey_wave = ?`;
  const params: string[] = [wave];
  if (lga) {
    query += " AND lga = ?";
    params.push(lga);
  }
  const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
  const parsed = rows.map((r) => ({ ...r, lga: r.lga as string, answers: JSON.parse(r.answers as string) as Answers }));

  const total = parsed.length;
  const byLga: Record<string, number> = {};
  for (const r of parsed) byLga[r.lga] = (byLga[r.lga] || 0) + 1;

  const tally = (key: keyof Answers) => {
    const counts: Record<string, number> = {};
    for (const r of parsed) {
      const v = r.answers[key];
      if (v === undefined || v === null) continue;
      const k = String(v);
      counts[k] = (counts[k] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count, percent: total ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);
  };

  const stigmaReportedCount = parsed.filter((r) => r.answers.reports_stigma).length;
  const wantsCounsellingCount = parsed.filter((r) => r.answers.wants_counselling).length;
  const willingToSupportCount = parsed.filter((r) => r.answers.willing_to_support).length;
  const willingToReferCount = parsed.filter((r) => r.answers.willing_to_refer).length;

  const payload: Record<string, unknown> = {
    geographicCoverage: { totalRespondents: total, byLga, targetLgas: 6 },
    communityPerceptionStigma: {
      acceptanceLevels: tally("community_acceptance"),
      stigmaReportedPercent: total ? Math.round((stigmaReportedCount / total) * 100) : 0,
      discriminationTypes: tally("discrimination_types"),
    },
    challenges: tally("main_challenge"),
    digitalSkillsDemand: tally("digital_skill_demand"),
    psychosocial: {
      wantsCounsellingPercent: total ? Math.round((wantsCounsellingCount / total) * 100) : 0,
    },
    communityReadiness: {
      willingToSupportPercent: total ? Math.round((willingToSupportCount / total) * 100) : 0,
      willingToReferPercent: total ? Math.round((willingToReferCount / total) * 100) : 0,
    },
    wave,
  };

  if (canAccessEnumeratorMonitoring(user)) {
    const enumeratorCounts: Record<string, number> = {};
    let duplicates = 0;
    let totalDuration = 0;
    for (const r of rows) {
      const eid = (r.enumerator_id as string) || "unknown";
      enumeratorCounts[eid] = (enumeratorCounts[eid] || 0) + 1;
      if (r.is_duplicate) duplicates += 1;
      totalDuration += (r.duration_seconds as number) || 0;
    }
    payload.dataQuality = {
      interviewsPerEnumerator: Object.entries(enumeratorCounts).map(([enumeratorId, count]) => ({ enumeratorId, count })),
      duplicateSubmissions: duplicates,
      avgDurationSeconds: total ? Math.round(totalDuration / total) : 0,
    };
  }

  return Response.json(payload);
}
