"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageThread } from "@/components/MessageThread";
import {
  fetchInbox,
  fetchMessages,
  formatMessageTime,
  sendMessage,
  type ConversationWithPreview,
  type Message,
} from "@/lib/messages";

export function AdminMessages() {
  const [inbox, setInbox] = useState<ConversationWithPreview[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = inbox.find((row) => row.id === selectedId) ?? null;

  const loadInbox = useCallback(async () => {
    setLoadingInbox(true);
    setError(null);
    try {
      const rows = await fetchInbox();
      setInbox(rows);
      setSelectedId((prev) => prev ?? rows[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inbox");
    } finally {
      setLoadingInbox(false);
    }
  }, []);

  const loadThread = useCallback(async (conversationId: string) => {
    setLoadingThread(true);
    setError(null);
    try {
      const rows = await fetchMessages(conversationId);
      setMessages(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load thread");
      setMessages([]);
    } finally {
      setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    void loadThread(selectedId);
  }, [selectedId, loadThread]);

  async function handleSend(content: string) {
    if (!selectedId) return;
    setSending(true);
    setError(null);
    try {
      const created = await sendMessage(selectedId, "admin", content);
      setMessages((prev) => [...prev, created]);
      setInbox((prev) => {
        const next = prev.map((row) =>
          row.id === selectedId
            ? {
                ...row,
                lastMessage: created,
                lastActivityAt: created.created_at,
              }
            : row,
        );
        return next.sort((a, b) =>
          b.lastActivityAt.localeCompare(a.lastActivityAt),
        );
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-14 border border-parchment bg-paper md:mt-16">
      <div className="border-b border-parchment px-5 py-5 md:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
          Support
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium text-ink md:text-[1.75rem]">
          Messages
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-sm text-ink/65">
          Inbox across all subscriber conversations — reply as Archive No.
        </p>
      </div>

      {error ? (
        <p className="border-b border-parchment px-5 py-3 font-sans text-sm text-oxblood md:px-6">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="border-b border-parchment lg:col-span-5 lg:border-b-0 lg:border-r">
          {loadingInbox ? (
            <p className="px-5 py-8 font-sans text-sm text-ink/55 md:px-6">
              Loading...
            </p>
          ) : (
            <ul className="divide-y divide-parchment">
              {inbox.map((row) => {
                const active = row.id === selectedId;
                const preview =
                  row.lastMessage?.content ?? "No messages yet";
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(row.id)}
                      className={`w-full px-5 py-4 text-left transition-opacity hover:opacity-80 md:px-6 ${
                        active ? "bg-parchment/50" : "bg-paper"
                      }`}
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
                        {preview}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="lg:col-span-7">
          {selected ? (
            <div className="px-5 py-5 md:px-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">
                {selected.subscriber_id}
              </p>
              <h3 className="mt-1 font-display text-xl text-ink">
                {selected.subscriber_name}
              </h3>
              <div className="mt-5">
                <MessageThread
                  messages={messages}
                  selfRole="admin"
                  loading={loadingThread}
                  sending={sending}
                  onSend={handleSend}
                />
              </div>
            </div>
          ) : (
            <p className="px-5 py-10 font-sans text-sm text-ink/55 md:px-6">
              Select a conversation.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
