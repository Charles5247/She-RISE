"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getJson, patchJson } from "./apiClient";

export interface NotificationItem {
  id: string;
  kind: string;
  body: string;
  postId: string | null;
  href: string | null;
  actor: { firstName: string; avatarUrl: string | null } | null;
  createdAt: string;
  read: boolean;
}
export interface NotificationInbox { today: NotificationItem[]; earlier: NotificationItem[]; unreadCount: number }

export function useNotifications(enabled = true) {
  const [data, setData] = useState<NotificationInbox | null>(null);
  const [error, setError] = useState("");
  const requestVersion = useRef(0);
  const refresh = useCallback(async () => {
    if (!enabled) return;
    const version = ++requestVersion.current;
    const result = await getJson<NotificationInbox>("/api/notifications");
    if (version !== requestVersion.current) return;
    if (result.ok && result.data) { setData(result.data); setError(""); }
    else setError(result.message);
  }, [enabled]);
  useEffect(() => {
    if (!enabled) return;
    const refreshVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- State is updated after the notification request resolves.
    void refresh();
    const timer = window.setInterval(refreshVisible, 30000);
    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    window.addEventListener("sherise-notifications-read", refreshVisible);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps -- This is a request counter, not a DOM ref; invalidate the latest in-flight request.
      requestVersion.current++;
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
      window.removeEventListener("sherise-notifications-read", refreshVisible);
    };
  }, [enabled, refresh]);
  async function markRead(id?: string) {
    const result = await patchJson("/api/notifications", id ? { id } : {});
    if (!result.ok) { setError(result.message); return false; }
    await refresh();
    window.dispatchEvent(new Event("sherise-notifications-read"));
    return true;
  }
  return { data, error, refresh, markRead };
}
