export type SubscriberTier = "Starter" | "Signature" | "Archivist";
export type SubscriberStatus = "Active" | "Paused";

export type Subscriber = {
  id: string;
  name: string;
  tier: SubscriberTier;
  joinDate: string; // ISO date YYYY-MM-DD
  itemsOut: number;
  status: SubscriberStatus;
  address: string;
};

/**
 * Roster sample aligned with Supabase conversations.subscriber_id
 * (SUB-001 … SUB-008) — single source of truth across the app.
 * James Whitaker = SUB-005 = My Closet demo member.
 */
export const subscribers: Subscriber[] = [
  {
    id: "SUB-001",
    name: "Marcus Chen",
    tier: "Archivist",
    joinDate: "2025-11-02",
    itemsOut: 5,
    status: "Active",
    address: "142 Maple Street, Portland, OR 97205",
  },
  {
    id: "SUB-002",
    name: "Julian Okonkwo",
    tier: "Signature",
    joinDate: "2025-12-14",
    itemsOut: 2,
    status: "Active",
    address: "88 Riverside Ave, Austin, TX 78701",
  },
  {
    id: "SUB-003",
    name: "Elena Vargas",
    tier: "Starter",
    joinDate: "2026-01-08",
    itemsOut: 2,
    status: "Active",
    address: "415 Valencia Street, San Francisco, CA 94103",
  },
  {
    id: "SUB-004",
    name: "Theo Brennan",
    tier: "Signature",
    joinDate: "2026-02-01",
    itemsOut: 4,
    status: "Active",
    address: "27 Beacon Hill Road, Boston, MA 02108",
  },
  {
    id: "SUB-005",
    name: "James Whitaker",
    tier: "Signature",
    joinDate: "2026-03-12",
    itemsOut: 3,
    status: "Active",
    address: "903 West End Avenue, New York, NY 10025",
  },
  {
    id: "SUB-006",
    name: "Sofia Patel",
    tier: "Starter",
    joinDate: "2026-04-19",
    itemsOut: 1,
    status: "Paused",
    address: "612 N Orleans Street, Chicago, IL 60654",
  },
  {
    id: "SUB-007",
    name: "Nora Hale",
    tier: "Starter",
    joinDate: "2026-05-22",
    itemsOut: 3,
    status: "Active",
    address: "2101 Pearl Street, Boulder, CO 80302",
  },
  {
    id: "SUB-008",
    name: "Claire Duval",
    tier: "Starter",
    joinDate: "2026-06-03",
    itemsOut: 0,
    status: "Paused",
    address: "1544 Magazine Street, New Orleans, LA 70130",
  },
];

export function getSubscriberById(id: string) {
  return subscribers.find((s) => s.id === id);
}

export function getSubscriberByName(name: string) {
  return subscribers.find((s) => s.name === name);
}
