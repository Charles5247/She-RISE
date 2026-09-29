"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ParticipantDashboard } from "@/components/ParticipantDashboard";
import { LoadingState, ErrorState } from "@/components/States";
import { useSessionUser } from "@/lib/useSessionUser";
import { useNotifications, type NotificationItem } from "@/lib/useNotifications";
import { getJson } from "@/lib/apiClient";
import type { DashboardProgress, LearningAssignment } from "@/lib/dashboard-types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useSessionUser();
  const notifications = useNotifications(!!user);
  const [progress, setProgress] = useState<DashboardProgress | null>(null);
  const [assignments, setAssignments] = useState<LearningAssignment[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const [stats, tasks] = await Promise.all([getJson<DashboardProgress>("/api/me/progress"), getJson<{ assignments: LearningAssignment[] }>("/api/me/assignments")]);
    if (!stats.ok || !stats.data || !tasks.ok || !tasks.data) { setError(stats.message || tasks.message); return; }
    setProgress(stats.data); setAssignments(tasks.data.assignments); setError("");
  }, []);
  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Load authenticated dashboard data asynchronously.
    void load();
    const visible = () => { if (document.visibilityState === "visible") void load(); };
    const interval = window.setInterval(visible, 30000);
    window.addEventListener("focus", visible);
    return () => { window.clearInterval(interval); window.removeEventListener("focus", visible); };
  }, [user, load]);
  async function openNotification(item: NotificationItem) {
    setBusy(true);
    const success = item.read || await notifications.markRead(item.id);
    setBusy(false);
    if (!success || !item.href?.startsWith("/") || item.href.startsWith("//")) return;
    if (item.href.startsWith("/dashboard#")) await load();
    router.push(item.href);
  }
  if (loading || !user) return <LoadingState label="Loading your dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!progress) return <LoadingState label="Loading your activity..." />;
  return <ParticipantDashboard name={user.first_name} progress={progress} assignments={assignments} inbox={notifications.data} notificationError={notifications.error} notificationBusy={busy}
    onOpenNotification={item => void openNotification(item)} onRefreshNotifications={() => void notifications.refresh()} onMarkAllRead={async () => { setBusy(true); await notifications.markRead(); setBusy(false); }} />;
}
