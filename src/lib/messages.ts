import { supabase } from "@/lib/supabase";

export type SenderRole = "customer" | "admin";

export type Conversation = {
  id: string;
  subscriber_id: string;
  subscriber_name: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_role: SenderRole;
  content: string;
  created_at: string;
};

export type ConversationWithPreview = Conversation & {
  lastMessage: Message | null;
  lastActivityAt: string;
};

/**
 * Supabase seed ID for James Whitaker (My Closet mock user).
 * Note: local Subscriber Roster uses MEM-001 for the same person —
 * messaging always uses the Supabase subscriber_id.
 */
export const JAMES_WHITAKER_SUBSCRIBER_ID = "SUB-005";

export function formatMessageTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function fetchConversationBySubscriberId(subscriberId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("subscriber_id", subscriberId)
    .maybeSingle();

  if (error) throw error;
  return data as Conversation | null;
}

export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as Message[];
  // Seed rows share identical timestamps — prefer customer→admin as a stable tie-break.
  return rows.sort((a, b) => {
    const byTime = a.created_at.localeCompare(b.created_at);
    if (byTime !== 0) return byTime;
    if (a.sender_role === b.sender_role) return a.id.localeCompare(b.id);
    return a.sender_role === "customer" ? -1 : 1;
  });
}

export async function sendMessage(
  conversationId: string,
  senderRole: SenderRole,
  content: string,
) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_role: senderRole,
      content: content.trim(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Message;
}

export async function fetchInbox(): Promise<ConversationWithPreview[]> {
  const { data: conversations, error: convError } = await supabase
    .from("conversations")
    .select("*");

  if (convError) throw convError;

  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (msgError) throw msgError;

  const latestByConversation = new Map<string, Message>();
  for (const message of (messages ?? []) as Message[]) {
    if (!latestByConversation.has(message.conversation_id)) {
      latestByConversation.set(message.conversation_id, message);
    }
  }

  const rows: ConversationWithPreview[] = (
    (conversations ?? []) as Conversation[]
  ).map((conversation) => {
    const lastMessage = latestByConversation.get(conversation.id) ?? null;
    return {
      ...conversation,
      lastMessage,
      lastActivityAt: lastMessage?.created_at ?? conversation.created_at,
    };
  });

  return rows.sort((a, b) =>
    b.lastActivityAt.localeCompare(a.lastActivityAt),
  );
}
