"use client";
import { useState } from "react";
import { ParticipantDashboard } from "@/components/ParticipantDashboard";
import type { DashboardProgress, LearningAssignment } from "@/lib/dashboard-types";
import type { NotificationInbox, NotificationItem } from "@/lib/useNotifications";

const progress: DashboardProgress = {
  xpTotal: 360, streakCount: 7, progressPercent: 60, medalsEarned: 3, incomeTotal: 28500, lessonsCompleted: 12, totalLessons: 20,
  medals: [{ code: "first_lesson", label: "First Lesson", earned: true }, { code: "first_income", label: "First Income", earned: true }, { code: "streak_7", label: "7-Day Streak", earned: true }, { code: "pathway_complete", label: "Course Graduate", earned: false }],
  weeklyActivity: [1, 2, 1, 3, 1, 2, 2].map((count, i) => ({ date: `2026-09-${23 + i}`, count })),
  recentLessons: [{ id: "demo-1", title: "Pricing your first product", completedAt: "2026-09-29T10:00:00Z" }, { id: "demo-2", title: "Finishing a straight seam", completedAt: "2026-09-28T14:00:00Z" }, { id: "demo-3", title: "Choosing the right fabric", completedAt: "2026-09-27T09:00:00Z" }],
};
const assignments: LearningAssignment[] = [
  { id: "demo-1", title: "Make your first tote bag", instructions: "Use the straight-stitch technique from your last lesson to make a simple tote bag. Bring your finished piece to our next session and tell us what you learned.", dueDate: "2026-10-02", assignedBy: "Grace, your trainer", createdAt: "2026-09-29T08:00:00Z" },
  { id: "demo-2", title: "Create a simple price list", instructions: "List three products you would like to sell. Calculate your material costs and choose a selling price for each product.", dueDate: "2026-10-05", assignedBy: "SheRISE team", createdAt: "2026-09-28T08:00:00Z" },
];
const initialInbox: NotificationInbox = {
  unreadCount: 3,
  today: [
    { id: "n1", kind: "assignment", body: "Grace sent you an assignment: Make your first tote bag", href: "#assignment-demo-1", postId: null, actor: null, read: false, createdAt: "2026-09-29T08:00:00Z" },
    { id: "n2", kind: "trainer_message", body: "Grace sent you a message about your latest practice session.", href: null, postId: null, actor: null, read: false, createdAt: "2026-09-29T07:00:00Z" },
    { id: "n3", kind: "course", body: "New course added: Turning your skill into a business", href: "#learning", postId: null, actor: null, read: false, createdAt: "2026-09-29T06:00:00Z" },
  ],
  earlier: [{ id: "n4", kind: "assignment", body: "Your admin sent you an assignment: Create a simple price list", href: "#assignment-demo-2", postId: null, actor: null, read: true, createdAt: "2026-09-28T08:00:00Z" }],
};

export default function DemoDashboardPage() {
  const [inbox, setInbox] = useState(initialInbox);
  const [message, setMessage] = useState("");
  function open(item: NotificationItem) {
    setInbox(current => ({ ...current, unreadCount: Math.max(0, current.unreadCount - (item.read ? 0 : 1)), today: current.today.map(n => n.id === item.id ? { ...n, read: true } : n), earlier: current.earlier.map(n => n.id === item.id ? { ...n, read: true } : n) }));
    if (item.href) document.getElementById(item.href.slice(1))?.scrollIntoView({ behavior: "smooth", block: "center" });
    setMessage(item.kind === "trainer_message" ? "Demo message from Grace: Great work on your stitching! Bring your tote bag to our next session so we can review the finishing together." : "Demo notification marked as read.");
  }
  return <>
    <ParticipantDashboard demo name="Amara" progress={progress} assignments={assignments} inbox={inbox} onOpenNotification={open} onRefreshNotifications={() => setInbox(initialInbox)} onMarkAllRead={() => { setInbox(current => ({ unreadCount: 0, today: current.today.map(n => ({ ...n, read: true })), earlier: current.earlier.map(n => ({ ...n, read: true })) })); setMessage("All demo notifications marked as read."); }} />
    {message && <div className="sr-demo-message" role="status"><p>{message}</p><button onClick={() => setMessage("")} aria-label="Dismiss demo message">Dismiss</button></div>}
  </>;
}
