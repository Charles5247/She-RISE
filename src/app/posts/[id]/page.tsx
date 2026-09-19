"use client";
// Screen 11 — Post detail. Hero photo, action bar, comment list with
// trainer badge on trainer comments (Design Principle 05).
import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, trainerBadge, ChevronLeftIcon, HeartIcon, FormField, PButton } from "@/components";
import { Photo } from "@/components/Photo";
import { timeAgo } from "@/components/PostCard";
import { LoadingState, ErrorState } from "@/components/States";
import { getJson, postJson, deleteJson } from "@/lib/apiClient";

interface PostDetail {
  id: string;
  author: { id: string; firstName: string; avatarUrl: string | null; isVerifiedTrainer: boolean };
  body: string;
  photoUrl: string | null;
  milestoneType: string;
  createdAt: string;
  reactions: { cheer: number; hold: number; celebrate: number };
  namedReactors: { first_name: string; kind: string }[];
  myReaction: string | null;
}

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: { firstName: string; avatarUrl: string | null; isVerifiedTrainer: boolean };
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<{ post: PostDetail; comments: Comment[] }>(`/api/posts/${id}`);
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setPost(res.data.post);
    setComments(res.data.comments);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [load]);

  async function react() {
    if (!post) return;
    const had = !!post.myReaction;
    if (had) await deleteJson(`/api/posts/${id}/reactions`);
    else await postJson(`/api/posts/${id}/reactions`, { kind: "cheer" });
    setPost({ ...post, myReaction: had ? null : "cheer" });
  }

  async function submitComment() {
    if (!draft.trim()) return;
    setPosting(true);
    const res = await postJson<{ commentId: string }>(`/api/posts/${id}/comments`, { body: draft.trim() });
    setPosting(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setDraft("");
    load();
  }

  if (error && !post) return <ErrorState message={error} onRetry={load} />;
  if (!post) return <LoadingState label="Loading post…" />;

  const total = post.reactions.cheer + post.reactions.hold + post.reactions.celebrate;
  const isMilestone = post.milestoneType !== "none";

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
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}>Post</div>
      </header>

      <div
        style={{
          margin: 16,
          borderRadius: "var(--r-xxl)",
          overflow: "hidden",
          background: isMilestone ? "var(--c-plum)" : "#fff",
          color: isMilestone ? "var(--c-dark-text)" : "var(--c-ink)",
          border: isMilestone ? "none" : "1px solid var(--c-line)",
        }}
      >
        <div style={{ padding: "16px 16px 8px", display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar
            name={post.author.firstName}
            size={42}
            palette={isMilestone ? "bold" : "warm"}
            ring={post.author.isVerifiedTrainer ? "var(--c-gold)" : null}
            badge={post.author.isVerifiedTrainer ? trainerBadge() : null}
          />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{post.author.firstName}</div>
            <div style={{ fontSize: 11, opacity: 0.65 }}>{timeAgo(post.createdAt)} ago</div>
          </div>
        </div>
        {post.photoUrl !== null && <Photo label="post image" dark={isMilestone} aspectRatio="16/10" />}
        <div style={{ padding: 16, fontSize: 15, lineHeight: 1.6 }}>{post.body}</div>
        <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 18, borderTop: isMilestone ? "1px solid var(--c-dark-border)" : "1px solid var(--c-line-soft)" }}>
          <button
            onClick={react}
            style={{ display: "flex", alignItems: "center", gap: 6, color: post.myReaction ? "var(--c-magenta)" : "inherit", background: "none", border: "none", cursor: "pointer" }}
          >
            <HeartIcon size={20} filled={!!post.myReaction} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>{total} cheers</span>
          </button>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 10 }}>
          {comments.length} comment{comments.length === 1 ? "" : "s"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {comments.map((c) => (
            <div key={c.id} style={{ display: "flex", gap: 10 }}>
              <Avatar name={c.author.firstName} size={32} badge={c.author.isVerifiedTrainer ? trainerBadge() : null} ring={c.author.isVerifiedTrainer ? "var(--c-gold)" : null} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{c.author.firstName}</span>
                  {c.author.isVerifiedTrainer && (
                    <span
                      className="sr-label"
                      style={{ fontSize: 8, background: "var(--c-gold)", color: "var(--c-plum)", padding: "2px 6px", borderRadius: "var(--r-pill)", fontWeight: 800 }}
                    >
                      Trainer · Verified
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, marginTop: 2 }}>{c.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <FormField value={draft} onChange={setDraft} placeholder="Write a comment…" />
          </div>
          <div style={{ width: 84 }}>
            <PButton label={posting ? "…" : "Send"} onClick={submitComment} disabled={posting} size="sm" />
          </div>
        </div>
        {error && (
          <p className="text-xs mt-2" style={{ color: "var(--c-danger)" }}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
