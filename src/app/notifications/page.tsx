"use client";
// Screen 12 — Notifications. Grouped by day ("Today" / "Earlier this week"),
// avatar with kind-badge. Tapping a notification marks it read and (if it
// references a post) navigates to that post.
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, ChevronLeftIcon, HeartIcon, CommentIcon, BellIcon, EmptyState } from "@/components";
import { timeAgo } from "@/components/PostCard";
import { LoadingState, ErrorState } from "@/components/States";
import { getJson, patchJson } from "@/lib/apiClient";

interface NotificationItem {
  id: string;
  kind: string;
  body: string;
  postId: string | null;
  actor: { firstName: string; avatarUrl: string | null } | null;
  createdAt: string;
  read: boolean;
}

function kindIcon(kind: string) {
  if (kind === "comment") return <CommentIcon size={12} />;
  if (kind === "reaction") return <HeartIcon size={12} filled />;
  return <BellIcon size={12} />;
}

function NotificationRow({ n, onClick }: { n: NotificationItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        width: "100%",
        textAlign: "left",
        background: n.read ? "transparent" : "rgba(212,48,110,0.05)",
        border: "none",
        borderBottom: "1px solid var(--c-line-soft)",
        cursor: "pointer",
      }}
    >
      <Avatar
        name={n.actor?.firstName || "SheRISE"}
        size={40}
        palette="warm"
        imageUrl={n.actor?.avatarUrl ?? null}
        badge={{ bg: "var(--c-magenta)", icon: <span style={{ color: "#fff" }}>{kindIcon(n.kind)}</span> }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "var(--c-ink)" }}>{n.body}</div>
        <div style={{ fontSize: 11, color: "var(--c-ink-soft)", marginTop: 2 }}>{timeAgo(n.createdAt)} ago</div>
      </div>
      {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--c-magenta)" }} />}
    </button>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [data, setData] = useState<{ today: NotificationItem[]; earlier: NotificationItem[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<{ today: NotificationItem[]; earlier: NotificationItem[] }>("/api/notifications");
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setData(res.data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [load]);

  async function open(n: NotificationItem) {
    if (!n.read) await patchJson("/api/notifications", { id: n.id });
    if (n.postId) router.push(`/posts/${n.postId}`);
    else load();
  }

  if (error && !data) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingState label="Loading notifications…" />;

  const isEmpty = data.today.length === 0 && data.earlier.length === 0;

  return (
    <main style={{ minHeight: "100vh", background: "var(--c-off)", paddingBottom: 32 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 16px",
          borderBottom: "1px solid var(--c-line)",
          position: "sticky",
          top: 0,
          background: "var(--c-off)",
          zIndex: 10,
        }}
      >
        <button onClick={() => router.back()} aria-label="Back" style={{ color: "var(--c-ink)", width: 44, height: 44 }}>
          <ChevronLeftIcon size={22} />
        </button>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}>Notifications</div>
        {!isEmpty && (
          <button
            onClick={async () => {
              await patchJson("/api/notifications", {});
              load();
            }}
            className="sr-label"
            style={{ marginLeft: "auto", fontSize: 10, color: "var(--c-magenta)", background: "none", border: "none", cursor: "pointer" }}
          >
            Mark all read
          </button>
        )}
      </header>

      {isEmpty ? (
        <EmptyState icon={<BellIcon size={28} />} title="No notifications yet" body="You'll see cheers, comments, and trainer messages here." />
      ) : (
        <>
          {data.today.length > 0 && (
            <>
              <div className="sr-label" style={{ padding: "14px 16px 6px", fontSize: 10, color: "var(--c-ink-soft)" }}>
                Today
              </div>
              {data.today.map((n) => (
                <NotificationRow key={n.id} n={n} onClick={() => open(n)} />
              ))}
            </>
          )}
          {data.earlier.length > 0 && (
            <>
              <div className="sr-label" style={{ padding: "14px 16px 6px", fontSize: 10, color: "var(--c-ink-soft)" }}>
                Earlier this week
              </div>
              {data.earlier.map((n) => (
                <NotificationRow key={n.id} n={n} onClick={() => open(n)} />
              ))}
            </>
          )}
        </>
      )}
    </main>
  );
}
