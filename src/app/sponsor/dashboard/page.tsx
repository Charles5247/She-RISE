"use client";
import { useCallback, useEffect, useState } from "react";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson } from "@/lib/apiClient";
import { LoadingState, ErrorState } from "@/components/States";
import {
  StaffPortal,
  PortalCard,
  PortalStat,
  ParticipantIdentity,
} from "@/components/StaffPortal";
interface Data {
  sinceYear: number | null;
  womenSponsored: number;
  participants: {
    id: string;
    first_name: string;
    lga: string | null;
    skill_category: string | null;
    sponsored_since: string;
    lessons_completed: number;
  }[];
}
export default function SponsorDashboardPage() {
  const { user, loading } = useSessionUser({
    loginPath: "/admin/login",
    expectedRole: "sponsor",
  });
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const r = await getJson<Data>("/api/sponsor/dashboard");
    if (r.ok && r.data) {
      setData(r.data);
      setError("");
    } else setError(r.message);
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- State updates follow the remote request.
      void load();
    }
  }, [user, load]);
  if (loading || !user)
    return <LoadingState label="Loading sponsor portal..." />;
  return (
    <StaffPortal
      role="Sponsor"
      name={user.first_name}
      title="Your support. Her next step."
      subtitle={
        data?.sinceYear
          ? "Partner since " + data.sinceYear
          : "Follow the journeys you support."
      }
    >
      {error && <ErrorState message={error} onRetry={load} />}{" "}
      {!data && !error && <LoadingState label="Loading your sponsorships..." />}
      {data && (
        <>
          <div className="sr-portal-grid">
            <PortalStat label="Women you sponsor" value={data.womenSponsored} />
            <PortalStat
              label="Lessons completed by your participants"
              value={data.participants.reduce(
                (sum, p) => sum + Number(p.lessons_completed),
                0,
              )}
            />
          </div>
          <PortalCard>
            <h2>The women you support</h2>
            {!data.participants.length && (
              <p>
                No active sponsorships yet. An administrator can link
                participants to your account.
              </p>
            )}
            {data.participants.map((p) => (
              <article className="sr-portal-row" key={p.id}>
                <ParticipantIdentity
                  name={p.first_name}
                  detail={
                    [p.lga, p.skill_category].filter(Boolean).join(" / ") ||
                    "Learning journey"
                  }
                />
                <p>
                  Sponsored since{" "}
                  {new Date(p.sponsored_since).toLocaleDateString()}
                </p>
                <strong>{p.lessons_completed} lessons completed</strong>
              </article>
            ))}
          </PortalCard>
        </>
      )}
    </StaffPortal>
  );
}
