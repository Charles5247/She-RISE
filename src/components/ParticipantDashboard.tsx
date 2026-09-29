"use client";
import Link from "next/link";
import { Bell, ArrowUpRight, Flame, Medal, Wallet, BookOpen, CheckCircle2, MessageCircle, ClipboardList } from "lucide-react";
import { TabBar } from "./TabBar";
import type { DashboardProgress, LearningAssignment } from "@/lib/dashboard-types";
import type { NotificationInbox, NotificationItem } from "@/lib/useNotifications";

const naira = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
const dateLabel = (value: string) => new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", timeZone: "UTC" });

export function ParticipantDashboard({ name, progress, assignments, inbox, notificationError, notificationBusy, onOpenNotification, onMarkAllRead, onRefreshNotifications, demo = false }: {
  name: string;
  progress: DashboardProgress;
  assignments: LearningAssignment[];
  inbox: NotificationInbox | null;
  notificationError?: string;
  notificationBusy?: boolean;
  onOpenNotification: (item: NotificationItem) => void;
  onMarkAllRead: () => void;
  onRefreshNotifications: () => void;
  demo?: boolean;
}) {
  const notifications = inbox ? [...inbox.today, ...inbox.earlier].slice(0, 5) : [];
  const unread = inbox?.unreadCount ?? 0;
  const maxActivity = Math.max(1, ...progress.weeklyActivity.map(day => day.count));
  return <main className="sr-dashboard">
    {demo && <div className="sr-demo-banner"><strong>Demo dashboard</strong><span>A fictional participant’s activity. Sample figures only.</span><Link href="/login">Go to sign in <ArrowUpRight size={14} /></Link></div>}
    <header className="sr-dashboard-header">
      <Link href={demo ? "/demo/dashboard" : "/dashboard"} className="sr-dashboard-brand">SheRISE<span>.</span></Link>
      <nav aria-label="Dashboard shortcuts"><Link href={demo ? "#activity" : "/feed"}>Community</Link><a href="#notifications" className="sr-notification-bell" aria-label={`Notifications, ${unread} unread`}><Bell size={22} />{unread > 0 && <span className="sr-unread-badge" aria-hidden="true">{unread > 99 ? "99+" : unread}</span>}</a><span className="sr-dashboard-avatar" aria-label={`${name}'s profile`}>{name.slice(0, 1)}</span></nav>
    </header>
    <div className="sr-dashboard-body">
      <section className="sr-dashboard-welcome">
        <div><p className="sr-label">YOUR NEXT CHAPTER</p><h1>Keep rising, {name}.</h1><p>Every lesson, every small win. Your progress is right here.</p><Link className="sr-dashboard-primary" href={demo ? "#learning" : "/pathways"}>Continue learning <ArrowUpRight size={18} /></Link></div>
        <div className="sr-dashboard-streak"><Flame size={32} /><strong>{progress.streakCount}<span>day streak</span></strong><p>{progress.streakCount ? "Keep your momentum going." : "Your next lesson starts a new streak."}</p></div>
      </section>
      <section className="sr-dashboard-stats" aria-label="Your progress at a glance">
        {[{ label: "Lessons completed", value: progress.lessonsCompleted, detail: `of ${progress.totalLessons} available lessons`, icon: BookOpen },
          { label: "Medals earned", value: progress.medalsEarned, detail: "Your learning achievements", icon: Medal },
          { label: "Recorded earnings", value: naira(progress.incomeTotal), detail: "From your income milestones", icon: Wallet },
          { label: "Learning XP", value: progress.xpTotal.toLocaleString(), detail: "Points earned through learning", icon: CheckCircle2 }].map(stat => <article className="sr-dashboard-stat" key={stat.label}><stat.icon size={20} /><p>{stat.label}</p><strong>{stat.value}</strong><small>{stat.detail}</small></article>)}
      </section>
      <div className="sr-dashboard-columns">
        <div className="sr-dashboard-main">
          <section className="sr-dashboard-card" id="learning"><div className="sr-dashboard-section-title"><div><p className="sr-label">ONE STEP AT A TIME</p><h2>Your learning journey</h2></div><Link href={demo ? "#activity" : "/progress"}>View progress <ArrowUpRight size={16} /></Link></div><div className="sr-dashboard-progress-label"><span>{progress.lessonsCompleted} lessons completed</span><strong>{progress.progressPercent}%</strong></div><progress max={100} value={progress.progressPercent} aria-label="Learning completion" /><div className="sr-dashboard-week" aria-label="Lessons completed over the last seven days">{progress.weeklyActivity.map(day => <div key={day.date} title={`${dateLabel(day.date)}: ${day.count} lessons`}><span className="sr-dashboard-bar-track"><span style={{ height: `${day.count / maxActivity * 100}%` }} /></span><b>{day.count}</b><small>{new Date(day.date).toLocaleDateString("en-NG", { weekday: "short", timeZone: "UTC" })}</small></div>)}</div></section>
          <section className="sr-dashboard-card" id="assignments"><div className="sr-dashboard-section-title"><h2>Your assignments</h2><ClipboardList size={21} /></div>{!assignments.length && <p className="sr-dashboard-muted">No assignments yet. New activities from your trainer or admin will appear here.</p>}{assignments.map(assignment => <article className="sr-dashboard-assignment" id={`assignment-${assignment.id}`} key={assignment.id}><div className="sr-dashboard-section-title"><h3>{assignment.title}</h3>{assignment.dueDate && <span className="sr-dashboard-tag">Due {dateLabel(assignment.dueDate)}</span>}</div><p className="sr-dashboard-muted">From {assignment.assignedBy} · {dateLabel(assignment.createdAt)}</p><p className="sr-assignment-instructions">{assignment.instructions}</p></article>)}</section>
          <section className="sr-dashboard-card" id="activity"><div className="sr-dashboard-section-title"><h2>Recent activity</h2><span className="sr-dashboard-muted">Your latest steps forward</span></div>{!progress.recentLessons.length && <p className="sr-dashboard-muted">Complete your first lesson to start your activity record.</p>}{progress.recentLessons.map(lesson => <div className="sr-dashboard-activity" key={lesson.id}><CheckCircle2 size={20} /><div><strong>{lesson.title}</strong><p>Lesson completed</p></div><time dateTime={lesson.completedAt}>{dateLabel(lesson.completedAt)}</time></div>)}</section>
        </div>
        <aside className="sr-dashboard-aside">
          <section className="sr-dashboard-card sr-dashboard-notifications" id="notifications" aria-label="Notifications"><div className="sr-dashboard-section-title"><h2>Notifications</h2><span className="sr-dashboard-count" role="status">{unread} unread</span></div><p className="sr-dashboard-muted">Assignments, messages, and new courses.</p>{notificationError && <div role="alert"><p className="sr-portal-error">{notificationError}</p><button className="sr-dashboard-text-button" onClick={onRefreshNotifications}>Try again</button></div>}{!inbox && !notificationError && <p role="status">Loading notifications...</p>}{inbox && !notifications.length && <p className="sr-dashboard-empty">You’re all caught up. New activity will appear here.</p>}<div className="sr-dashboard-inbox">{notifications.map(item => <button key={item.id} className="sr-dashboard-notification" data-unread={!item.read} disabled={notificationBusy} onClick={() => onOpenNotification(item)}><span className="sr-dashboard-notification-icon">{item.kind === "trainer_message" ? <MessageCircle size={18} /> : item.kind === "assignment" ? <ClipboardList size={18} /> : <Bell size={18} />}</span><span><strong>{item.body}</strong><small>{dateLabel(item.createdAt)}{!item.read ? " · Unread" : " · Read"}</small></span>{!item.read && <i aria-hidden="true" />}</button>)}</div><div className="sr-dashboard-section-title"><Link href={demo ? "#notifications" : "/notifications"}>View all</Link><button className="sr-dashboard-text-button" onClick={onMarkAllRead} disabled={!unread || notificationBusy}>Mark all read</button></div></section>
          <section className="sr-dashboard-card"><div className="sr-dashboard-section-title"><h2>Your achievements</h2><Medal size={21} /></div><div className="sr-dashboard-medals">{progress.medals.map(medal => <div key={medal.code} data-earned={medal.earned}><span><Medal size={24} /></span><strong>{medal.label}</strong><small>{medal.earned ? "Earned" : "Keep going"}</small></div>)}</div></section>
        </aside>
      </div>
      {!demo && <Link className="sr-dashboard-demo-link" href="/demo/dashboard">Preview a sample activity dashboard <ArrowUpRight size={16} /></Link>}
    </div>
    {!demo && <TabBar />}
  </main>;
}
