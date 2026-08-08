"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageThread } from "@/components/MessageThread";
import {
  fetchConversationBySubscriberId,
  fetchMessages,
  JAMES_WHITAKER_SUBSCRIBER_ID,
  sendMessage,
  type Conversation,
  type Message,
} from "@/lib/messages";

export function CustomerMessages() {
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
      const rows = await fetchMessages(convo.id);
      setMessages(rows);
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
      setError(err instanceof Error ? err.message : "Failed to send message");
      // Restore draft context by reloading on hard failure
      await load();
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-16 w-full border-t border-parchment pt-12 md:mt-20 md:pt-16">
      <h2 className="font-display text-2xl font-medium text-ink md:text-[1.75rem]">
        Messages
      </h2>
      <p className="mt-2 font-sans text-sm text-ink/65">
        Direct line to Archive No. about your rotation.
      </p>

      {error ? (
        <p className="mt-4 font-sans text-sm text-oxblood">{error}</p>
      ) : null}

      <div className="mt-8">
        {!loading && !conversation ? (
          <p className="font-sans text-sm text-ink/55">
            No conversation found for this member.
          </p>
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
    </section>
  );
}
