import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /admin/referrals?range=90d — funnel counts + drop-off reasons (screen 28)
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  if (!["admin", "trainer", "sponsor"].includes(user.role)) {
    return Response.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "90d";
  const days = range === "30d" ? 30 : range === "90d" ? 90 : range === "ytd" ? 365 : 3650;

  const db = getDb();
  const rows = (await db
    .prepare(`SELECT stage, drop_off_reason, lga FROM referrals WHERE created_at > NOW() - (? || ' days')::interval`)
    .all(String(days))) as { stage: string; drop_off_reason: string | null; lga: string }[];

  const stages = ["referred", "screened", "eligible", "enrolled"] as const;
  const counts: Record<string, number> = { referred: 0, screened: 0, eligible: 0, enrolled: 0 };
  // Funnel is cumulative: a referral that reached "enrolled" also passed through
  // all earlier stages, so count it toward every stage up to and including its own.
  const stageIndex: Record<string, number> = { referred: 0, screened: 1, eligible: 2, enrolled: 3 };
  for (const r of rows) {
    const idx = stageIndex[r.stage];
    for (let i = 0; i <= idx; i++) counts[stages[i]] += 1;
  }

  const funnel = stages.map((s, i) => ({
    stage: s,
    count: counts[s],
    dropOff: i > 0 ? counts[stages[i - 1]] - counts[s] : 0,
    dropOffPercent: i > 0 && counts[stages[i - 1]] > 0 ? Math.round(((counts[stages[i - 1]] - counts[s]) / counts[stages[i - 1]]) * 100) : 0,
  }));

  const reasonCounts: Record<string, number> = {};
  for (const r of rows) {
    if (r.drop_off_reason) reasonCounts[r.drop_off_reason] = (reasonCounts[r.drop_off_reason] || 0) + 1;
  }
  const dropOffReasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([reason, count]) => ({ reason, count }));

  const lgaCounts: Record<string, { total: number; enrolled: number }> = {};
  for (const r of rows) {
    lgaCounts[r.lga] = lgaCounts[r.lga] || { total: 0, enrolled: 0 };
    lgaCounts[r.lga].total += 1;
    if (r.stage === "enrolled") lgaCounts[r.lga].enrolled += 1;
  }
  const topLgaConversion = Object.entries(lgaCounts)
    .map(([lga, v]) => ({ lga, total: v.total, enrolled: v.enrolled, conversionPercent: v.total ? Math.round((v.enrolled / v.total) * 100) : 0 }))
    .sort((a, b) => b.conversionPercent - a.conversionPercent)
    .slice(0, 6);

  // "Signal" insight — surfaces the top drop-off reason at the weakest funnel step
  const weakestStep = funnel.slice(1).sort((a, b) => b.dropOffPercent - a.dropOffPercent)[0];
  const signal = dropOffReasons[0]
    ? `${dropOffReasons[0].reason} accounts for ${dropOffReasons[0].count} drop-offs — concentrated around the ${weakestStep?.stage} step (${weakestStep?.dropOffPercent}% loss).`
    : "Not enough drop-off data yet to surface a signal.";

  return Response.json({ funnel, dropOffReasons, topLgaConversion, signal });
}
