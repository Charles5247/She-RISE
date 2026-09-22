"use client";
// Screen 09 — Community feed. Milestone-first feed with story bar, hero
// milestone cards, compact posts, and the bottom TabBar. Empty state
// (#/empty-feed) shows for a newcomer with zero circles/posts yet.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { TabBar, Avatar, EmptyState, BellIcon, PlusIcon } from "@/components";
import { PostCard, type PostData } from "@/components/PostCard";
import { LoadingState, ErrorState, OfflineBanner } from "@/components/States";
import { getJson, postJson, deleteJson } from "@/lib/apiClient";
import { useSessionUser } from "@/lib/useSessionUser";

interface CircleSummary {
  id: string;
  name: string;
  joined: boolean;
}

export default function FeedPage() {
  const { user, loading: userLoading } = useSessionUser();
  const [posts, setPosts] = useState<PostData[] | null>(null);
  const [circles, setCircles] = useState<CircleSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [postsRes, circlesRes] = await Promise.all([
      getJson<{ posts: PostData[] }>("/api/posts"),
      getJson<{ circles: CircleSummary[] }>("/api/circles"),
    ]);
    if (!postsRes.ok) {
      setError(postsRes.message);
      return;
    }
    setPosts(postsRes.data?.posts ?? []);
    setCircles(circlesRes.data?.circles ?? []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API, not synchronously in the effect body.
    if (!userLoading) load();
  }, [userLoading, load]);

  async function react(postId: string, kind: "cheer" | "hold" | "celebrate") {
    const current = posts?.find((p) => p.id === postId);
    if (!current) return;
    const hadReaction = !!current.myReaction;
    if (hadReaction) {
      await deleteJson(`/api/posts/${postId}/reactions`);
    } else {
      await postJson(`/api/posts/${postId}/reactions`, { kind });
    }
    setPosts((prev) =>
      prev?.map((p) =>
        p.id === postId
          ? {
              ...p,
              myReaction: hadReaction ? null : kind,
              reactionTotal: p.reactionTotal + (hadReaction ? -1 : 1),
            }
          : p
      ) ?? null
    );
  }

  if (userLoading || posts === null) {
    if (error) return <ErrorState message={error} onRetry={load} />;
    return <LoadingState label="Loading your feed…" />;
  }

  const joinedCircles = circles.filter((c) => c.joined);
  const isEmpty = posts.length === 0 && joinedCircles.length === 0;

  return (
    <main style={{ minHeight: "100vh", background: "var(--c-cream)", paddingBottom: 100 }}>
      <OfflineBanner />
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "var(--c-off)",
          borderBottom: "1px solid var(--c-line)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="sr-label" style={{ fontSize: 13, fontWeight: 800, color: "var(--c-plum)" }}>
          SHE.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/notifications" aria-label="Notifications" style={{ color: "var(--c-ink)" }}>
            <BellIcon size={20} />
          </Link>
          <Link href="/profile" aria-label="My profile">
            <Avatar name={user?.first_name || "Me"} size={30} palette="warm" imageUrl={user?.avatar_url ?? null} />
          </Link>
        </div>
      </header>

      {joinedCircles.length > 0 && (
        <div className="sr-scroll-x" style={{ display: "flex", gap: 10, padding: "14px 16px" }}>
          {joinedCircles.map((c) => (
            <Link
              key={c.id}
              href="/circles"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 60 }}
            >
              <Avatar name={c.name} size={52} palette="bold" ring="var(--c-gold)" />
              <div style={{ fontSize: 10, color: "var(--c-ink-soft)", textAlign: "center", maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.name}
              </div>
            </Link>
          ))}
        </div>
      )}

      {isEmpty ? (
        <EmptyState
          icon={<PlusIcon size={30} />}
          title="Your feed is quiet — for now"
          body="Join a circle or share your first milestone to see the community here."
          action={
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href="/circles"
                className="text-xs font-bold uppercase px-4 py-2 rounded-lg"
                style={{ background: "var(--c-cream)", color: "var(--c-ink)", fontFamily: "var(--font-display)" }}
              >
                Browse circles
              </Link>
              <Link
                href="/composer"
                className="text-xs font-bold uppercase px-4 py-2 rounded-lg text-white"
                style={{ background: "var(--c-magenta)", fontFamily: "var(--font-display)" }}
              >
                Share a win
              </Link>
            </div>
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px 16px 16px" }}>
          {posts.length === 0 ? (
            <EmptyState title="No posts yet" body="Be the first in your circle to share a milestone." />
          ) : (
            posts.map((p) => <PostCard key={p.id} post={p} onReact={(kind) => react(p.id, kind)} />)
          )}
        </div>
      )}

      <TabBar />
    </main>
  );
}
