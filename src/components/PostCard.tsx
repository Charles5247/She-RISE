"use client";
// PostCard — feed post rendering, shared between /feed and /posts/[id].
// Milestone posts get the bold plum hero treatment with a gold pill;
// ordinary posts render as a compact card. Reactions are named
// ("cheer/hold/celebrate") per Design Principle 07 — never "likes".
import Link from "next/link";
import { Avatar, trainerBadge } from "./Avatar";
import { Photo } from "./Photo";
import { HeartIcon, CommentIcon, ShareIcon } from "./Icon";

export interface PostAuthor {
  id: string;
  firstName: string;
  avatarUrl: string | null;
  isVerifiedTrainer: boolean;
}

export interface PostData {
  id: string;
  author: PostAuthor;
  body: string;
  photoUrl: string | null;
  milestoneType: string;
  createdAt: string;
  reactions: { cheer: number; hold: number; celebrate: number };
  reactionTotal: number;
  namedReactors: { first_name: string; kind: string }[];
  myReaction: string | null;
  commentCount: number;
}

const MILESTONE_LABELS: Record<string, string> = {
  first_income: "First income",
  week_complete: "Week complete",
  new_skill: "New skill",
};

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function reactionSummary(post: PostData): string {
  if (post.reactionTotal === 0) return "";
  const names = post.namedReactors.map((r) => r.first_name);
  if (names.length === 0) return `${post.reactionTotal} reacted`;
  const rest = post.reactionTotal - names.length;
  const label = names.join(", ") + (rest > 0 ? ` and ${rest} other${rest > 1 ? "s" : ""}` : "");
  return label;
}

export function PostCard({
  post,
  onReact,
  linkToDetail = true,
}: {
  post: PostData;
  onReact?: (kind: "cheer" | "hold" | "celebrate") => void;
  linkToDetail?: boolean;
}) {
  const isMilestone = Boolean(post.milestoneType && post.milestoneType !== "none");
  const CardInner = (
    <div
      style={{
        borderRadius: "var(--r-xxl)",
        overflow: "hidden",
        background: isMilestone ? "var(--c-plum)" : "#fff",
        color: isMilestone ? "var(--c-dark-text)" : "var(--c-ink)",
        border: isMilestone ? "none" : "1px solid var(--c-line)",
        boxShadow: isMilestone ? "var(--shadow-card-magenta)" : "none",
      }}
    >
      <div style={{ padding: "16px 16px 8px", display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar
          name={post.author.firstName}
          size={38}
          palette={isMilestone ? "bold" : "warm"}
          ring={post.author.isVerifiedTrainer ? "var(--c-gold)" : null}
          badge={post.author.isVerifiedTrainer ? trainerBadge() : null}
          imageUrl={post.author.avatarUrl}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{post.author.firstName}</div>
          <div style={{ fontSize: 11, opacity: 0.65 }}>{timeAgo(post.createdAt)} ago</div>
        </div>
        {isMilestone && (
          <div
            className="sr-label"
            style={{
              fontSize: 9,
              padding: "4px 10px",
              borderRadius: "var(--r-pill)",
              background: "var(--c-gold)",
              color: "var(--c-plum)",
              fontWeight: 800,
            }}
          >
            {MILESTONE_LABELS[post.milestoneType] || post.milestoneType}
          </div>
        )}
      </div>

      <div style={{ padding: "0 16px 12px", fontSize: 14, lineHeight: 1.5 }}>{post.body}</div>

      {post.photoUrl !== null && (
        <Photo label="post image" tone={isMilestone ? "var(--c-plum-mid)" : undefined} dark={isMilestone} aspectRatio="16/10" />
      )}

      <div
        style={{
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          borderTop: isMilestone ? "1px solid var(--c-dark-border)" : "1px solid var(--c-line-soft)",
        }}
      >
        <button
          type="button"
          onClick={() => onReact?.("cheer")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: post.myReaction ? "var(--c-magenta)" : "inherit",
            background: "none",
            border: "none",
            cursor: onReact ? "pointer" : "default",
            minHeight: 32,
          }}
        >
          <HeartIcon size={18} filled={Boolean(post.myReaction)} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>{post.reactionTotal}</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.85 }}>
          <CommentIcon size={17} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>{post.commentCount}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.85 }}>
          <ShareIcon size={17} />
        </div>
        {post.reactionTotal > 0 && (
          <div style={{ fontSize: 11, opacity: 0.7, marginLeft: "auto", textAlign: "right" }}>{reactionSummary(post)}</div>
        )}
      </div>
    </div>
  );

  if (!linkToDetail) return CardInner;
  return (
    <Link href={`/posts/${post.id}`} style={{ display: "block" }}>
      {CardInner}
    </Link>
  );
}
