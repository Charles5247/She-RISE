"use client";
// Screen 22 — 1:1 trainer DM. Message bubbles (magenta for me, white for
// them), typing composer. Trainer notes stay separate/private — never
// surfaced here (see API comment on the route).
import { Suspense, use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Avatar,
  trainerBadge,
  ChevronLeftIcon,
  FormField,
  PButton,
} from "@/components";
import { LoadingState, ErrorState } from "@/components/States";
import { getJson, postJson } from "@/lib/apiClient";
import { useSessionUser } from "@/lib/useSessionUser";

interface DmMessage {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

function TrainerChatPage({
  params,
}: {
  params: Promise<{ trainerId: string }>;
}) {
  const { trainerId } = use(params);
  const router = useRouter();
  const participantId = useSearchParams().get("participantId");
  const [partnerName, setPartnerName] = useState("Conversation");
  const { user } = useSessionUser({
    expectedRole: participantId ? "trainer" : "participant",
    loginPath: participantId ? "/admin/login" : "/login",
  });
  const [messages, setMessages] = useState<DmMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<{ messages: DmMessage[]; partnerName: string }>(
      `/api/trainer/chat/${trainerId}?participantId=${encodeURIComponent(participantId ?? "")}`,
    );
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setMessages(res.data.messages);
    setPartnerName(res.data.partnerName);
  }, [trainerId, participantId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!draft.trim()) return;
    setSending(true);
    const res = await postJson(`/api/trainer/chat/${trainerId}`, {
      body: draft.trim(),
      participantId,
    });
    setSending(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setDraft("");
    load();
  }

  if (error && !messages) return <ErrorState message={error} onRetry={load} />;
  if (!messages) return <LoadingState label="Loading conversation…" />;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--c-off)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
          borderBottom: "1px solid var(--c-line)",
        }}
      >
        <button
          onClick={() => router.back()}
          aria-label="Back"
          style={{ color: "var(--c-ink)", width: 44, height: 44 }}
        >
          <ChevronLeftIcon size={22} />
        </button>
        <Avatar
          name={partnerName}
          size={32}
          ring="var(--c-gold)"
          badge={user?.role === "trainer" ? undefined : trainerBadge()}
        />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{partnerName}</div>
          <div
            className="sr-label"
            style={{
              fontSize: 9,
              color: "var(--c-gold-deep)",
              fontWeight: 800,
            }}
          >
            {user?.role === "trainer"
              ? "Participant conversation"
              : "Trainer / Verified"}
          </div>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "var(--c-ink-soft)",
              fontSize: 12,
              marginTop: 40,
            }}
          >
            Say hello to start your conversation.
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: mine ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  padding: "10px 14px",
                  borderRadius: "var(--r-xl)",
                  background: mine ? "var(--c-magenta)" : "#fff",
                  color: mine ? "#fff" : "var(--c-ink)",
                  border: mine ? "none" : "1px solid var(--c-line)",
                  fontSize: 13,
                }}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div
        style={{
          padding: 12,
          borderTop: "1px solid var(--c-line)",
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <FormField
            value={draft}
            onChange={setDraft}
            placeholder="Write a message…"
          />
        </div>
        <div style={{ width: 84 }}>
          <PButton
            label={sending ? "…" : "Send"}
            onClick={send}
            disabled={sending}
            size="sm"
          />
        </div>
      </div>
      {error && (
        <p
          className="text-xs text-center pb-2"
          style={{ color: "var(--c-danger)" }}
        >
          {error}
        </p>
      )}
    </main>
  );
}

export default function Page({
  params,
}: {
  params: Promise<{ trainerId: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState label="Loading conversation?" />}>
      <TrainerChatPage params={params} />
    </Suspense>
  );
}
