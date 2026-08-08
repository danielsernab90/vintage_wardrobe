/** Client-side admin inbox read markers (conversationId → last-read ISO). */
const ADMIN_INBOX_READS_KEY = "archive-no-admin-inbox-reads";

export function loadAdminInboxReads(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ADMIN_INBOX_READS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function markAdminConversationRead(
  conversationId: string,
  readAt: string,
) {
  if (typeof window === "undefined") return;
  const next = { ...loadAdminInboxReads(), [conversationId]: readAt };
  window.localStorage.setItem(ADMIN_INBOX_READS_KEY, JSON.stringify(next));
}

/**
 * Unread for admin: latest message is from the customer and newer than
 * the admin's last open of that thread (or never opened).
 */
export function isAdminUnread(
  lastMessage: { sender_role: string; created_at: string } | null | undefined,
  conversationId: string,
  reads: Record<string, string>,
) {
  if (!lastMessage || lastMessage.sender_role !== "customer") return false;
  const lastRead = reads[conversationId];
  if (!lastRead) return true;
  return lastMessage.created_at > lastRead;
}
