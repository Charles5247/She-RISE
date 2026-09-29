"use client";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/useNotifications";

export function NotificationBell() {
  const { data, error } = useNotifications();
  const count = data?.unreadCount ?? 0;
  return <Link className="sr-notification-bell" href="/notifications" aria-label={error ? "Notifications, refresh unavailable" : `Notifications${count ? `, ${count} unread` : ""}`}>
    <Bell size={22} />
    {count > 0 && <span className="sr-unread-badge" aria-hidden="true">{count > 99 ? "99+" : count}</span>}
  </Link>;
}
