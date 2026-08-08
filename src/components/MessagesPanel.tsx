"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { MessageThread } from "@/components/MessageThread";
import { useAuth } from "@/context/AuthContext";
import { useMessagesUi } from "@/context/MessagesUiContext";
import { subscribers, getSubscriberById } from "@/data/subscribers";
import {
  fetchConversationBySubscriberId,
  fetchInbox,
  fetchMessages,
  formatMessageTime,
  getOrCreateConversation,
  JAMES_WHITAKER_SUBSCRIBER_ID,
  sendMessage,
  type Conversation,
  type ConversationWithPreview,
  type Message,
} from "@/lib/messages";

type Props = {
  open: boolean;
  onClose: () => void;
};

type SortMode = "newest" | "oldest";

export function MessagesPanel({ open, onClose }: Props) {
  const { role } = useAuth();
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !role) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center px-4 py-6 sm:items-center sm:px-5"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/30"
        aria-label="Close messages"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden border border-brass bg-paper shadow-[0_8px_28px_rgba(28,26,23,0.12)]"
      >
        {role === "customer" ? (
          <CustomerPanel titleId={titleId} onClose={onClose} />
        ) : (
          <AdminPanel titleId={titleId} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function PanelHeader({
  titleId,
  title,
  subtitle,
  onClose,
  onBack,
}: {
  titleId: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-parchment px-5 py-4">
      <div className="min-w-0">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50 transition-opacity hover:opacity-70"
          >
            ← Inbox
          </button>
        ) : (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
            Messages
          </p>
        )}
        <h2
          id={titleId}
          className="font-display text-xl font-medium leading-snug text-ink"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">
            {subtitle}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="shrink-0 font-mono text-[14px] leading-none text-ink/50 transition-opacity hover:opacity-70"
      >
        ×
      </button>
    </div>
  );
}

function CustomerPanel({
  titleId,
  onClose,
}: {
  titleId: string;
  onClose: () => void;
}) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const convo = await fetchConversationBySubscriberId(
        JAMES_WHITAKER_SUBSCRIBER_ID,
      );
      setConversation(convo);
      if (!convo) {
        setMessages([]);
        return;
      }
      setMessages(await fetchMessages(convo.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSend(content: string) {
    if (!conversation) return;
    setSending(true);
    setError(null);
    try {
      const created = await sendMessage(conversation.id, "customer", content);
      setMessages((prev) => [...prev, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <PanelHeader
        titleId={titleId}
        title="Archive No."
        subtitle={JAMES_WHITAKER_SUBSCRIBER_ID}
        onClose={onClose}
      />
      {error ? (
        <p className="border-b border-parchment px-5 py-3 font-sans text-sm text-oxblood">
          {error}
        </p>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {!loading && !conversation ? (
          <p className="font-sans text-sm text-ink/55">No conversation found.</p>
        ) : (
          <MessageThread
            messages={messages}
            selfRole="customer"
            loading={loading}
            sending={sending}
            onSend={handleSend}
          />
        )}
      </div>
    </>
  );
}

function AdminPanel({
  titleId,
  onClose,
}: {
  titleId: string;
  onClose: () => void;
}) {
  const { focusSubscriberId, clearFocus } = useMessagesUi();
  const [inbox, setInbox] = useState<ConversationWithPreview[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [pickingSubscriber, setPickingSubscriber] = useState(false);

  const loadInbox = useCallback(async () => {
    setLoadingInbox(true);
    setError(null);
    try {
      setInbox(await fetchInbox());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inbox");
    } finally {
      setLoadingInbox(false);
    }
  }, []);

  /**
   * Shared path for Roster "Message", inbox row click, and "+ New Message".
   * Opens the subscriber's thread whether or not they have message history.
   */
  const openSubscriberThread = useCallback(async (subscriberId: string) => {
    const roster = getSubscriberById(subscriberId);
    const name = roster?.name ?? subscriberId;
    setPickingSubscriber(false);
    setLoadingThread(true);
    setError(null);
    try {
      const conversation = await getOrCreateConversation(subscriberId, name);
      setActive(conversation);
      setMessages(await fetchMessages(conversation.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open thread");
      setActive(null);
      setMessages([]);
    } finally {
      setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    if (!focusSubscriberId) return;
    const id = focusSubscriberId;
    clearFocus();
    void openSubscriberThread(id);
  }, [focusSubscriberId, clearFocus, openSubscriberThread]);

  const visibleInbox = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? inbox.filter((row) => row.subscriber_name.toLowerCase().includes(q))
      : inbox;
    return [...filtered].sort((a, b) =>
      sortMode === "newest"
        ? b.lastActivityAt.localeCompare(a.lastActivityAt)
        : a.lastActivityAt.localeCompare(b.lastActivityAt),
    );
  }, [inbox, search, sortMode]);

  async function handleSend(content: string) {
    if (!active) return;
    setSending(true);
    setError(null);
    try {
      const created = await sendMessage(active.id, "admin", content);
      setMessages((prev) => [...prev, created]);
      setInbox((prev) => {
        const existing = prev.find((row) => row.id === active.id);
        const nextRow: ConversationWithPreview = existing
          ? {
              ...existing,
              lastMessage: created,
              lastActivityAt: created.created_at,
            }
          : {
              ...active,
              lastMessage: created,
              lastActivityAt: created.created_at,
            };
        const without = prev.filter((row) => row.id !== active.id);
        return [...without, nextRow].sort((a, b) =>
          b.lastActivityAt.localeCompare(a.lastActivityAt),
        );
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  function backToInbox() {
    setActive(null);
    setMessages([]);
    setPickingSubscriber(false);
    void loadInbox();
  }

  if (active) {
    return (
      <>
        <PanelHeader
          titleId={titleId}
          title={active.subscriber_name}
          subtitle={active.subscriber_id}
          onClose={onClose}
          onBack={backToInbox}
        />
        {error ? (
          <p className="border-b border-parchment px-5 py-3 font-sans text-sm text-oxblood">
            {error}
          </p>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <MessageThread
            messages={messages}
            selfRole="admin"
            loading={loadingThread}
            sending={sending}
            onSend={handleSend}
          />
        </div>
      </>
    );
  }

  if (pickingSubscriber) {
    return (
      <>
        <PanelHeader
          titleId={titleId}
          title="New Message"
          subtitle="Choose a subscriber"
          onClose={onClose}
          onBack={() => setPickingSubscriber(false)}
        />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ul className="divide-y divide-parchment">
            {subscribers.map((sub) => (
              <li key={sub.id}>
                <button
                  type="button"
                  onClick={() => void openSubscriberThread(sub.id)}
                  className="flex w-full items-baseline justify-between gap-3 px-5 py-4 text-left transition-opacity hover:opacity-80"
                >
                  <span className="font-display text-base text-ink">
                    {sub.name}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">
                    {sub.id}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }

  return (
    <>
      <PanelHeader titleId={titleId} title="Inbox" onClose={onClose} />
      <div className="flex flex-col gap-3 border-b border-parchment px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPickingSubscriber(true)}
            className="bg-ink px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-paper transition-opacity hover:opacity-80"
          >
            + New Message
          </button>
          <label className="ml-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55">
            <span className="sr-only">Sort</span>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="border border-parchment bg-paper px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink outline-none"
              aria-label="Sort conversations"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
            </select>
          </label>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          aria-label="Search conversations"
          className="w-full border border-parchment bg-paper px-3 py-2 font-sans text-sm text-ink placeholder:text-ink/40 outline-none focus:border-ink/30"
        />
      </div>
      {error ? (
        <p className="border-b border-parchment px-5 py-3 font-sans text-sm text-oxblood">
          {error}
        </p>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loadingInbox ? (
          <p className="px-5 py-8 font-sans text-sm text-ink/55">Loading...</p>
        ) : visibleInbox.length === 0 ? (
          <p className="px-5 py-8 font-sans text-sm text-ink/55">
            {search.trim()
              ? "No conversations match that name."
              : "No active conversations yet."}
          </p>
        ) : (
          <ul className="divide-y divide-parchment">
            {visibleInbox.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => void openSubscriberThread(row.subscriber_id)}
                  className="w-full px-5 py-4 text-left transition-opacity hover:opacity-80"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display text-base text-ink">
                      {row.subscriber_name}
                    </p>
                    <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">
                      {formatMessageTime(row.lastActivityAt)}
                    </p>
                  </div>
                  <p className="mt-1.5 line-clamp-2 font-sans text-sm text-ink/60">
                    {row.lastMessage?.content}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
