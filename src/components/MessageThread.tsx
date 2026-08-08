"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  formatMessageTime,
  type Message,
  type SenderRole,
} from "@/lib/messages";

type Props = {
  messages: Message[];
  /** Whose messages appear on the right (the "self" role for this view). */
  selfRole: SenderRole;
  loading?: boolean;
  emptyLabel?: string;
  sending?: boolean;
  onSend: (content: string) => Promise<void> | void;
};

export function MessageThread({
  messages,
  selfRole,
  loading = false,
  emptyLabel = "No messages yet",
  sending = false,
  onSend,
}: Props) {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll only within the thread pane — never the page (scrollIntoView was
  // jumping /account and /admin down to Messages after login load).
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setDraft("");
    await onSend(content);
  }

  return (
    <div className="flex flex-col border border-parchment bg-paper">
      <div
        ref={listRef}
        className="max-h-[28rem] min-h-[16rem] space-y-4 overflow-y-auto px-4 py-5 md:px-5"
      >
        {loading ? (
          <p className="font-sans text-sm text-ink/55">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="font-sans text-sm text-ink/55">{emptyLabel}</p>
        ) : (
          messages.map((message) => {
            const mine = message.sender_role === selfRole;
            return (
              <div
                key={message.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] border px-3 py-2.5 sm:max-w-[75%] ${
                    mine
                      ? "border-ink bg-ink text-paper"
                      : "border-parchment bg-paper text-ink"
                  }`}
                >
                  <p className="font-sans text-sm leading-relaxed">
                    {message.content}
                  </p>
                </div>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">
                  {formatMessageTime(message.created_at)}
                  {" · "}
                  {message.sender_role}
                </p>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-t border-parchment p-4 sm:flex-row sm:items-stretch md:p-5"
      >
        <label htmlFor="message-draft" className="sr-only">
          Message
        </label>
        <input
          id="message-draft"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          disabled={sending || loading}
          className="w-full border border-ink/20 bg-paper px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-ink disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || loading || !draft.trim()}
          className="shrink-0 bg-ink px-5 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-paper transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
