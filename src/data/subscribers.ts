export type SubscriberTier = "Starter" | "Signature" | "Archivist";
export type SubscriberStatus = "Active" | "Paused";

export type Subscriber = {
  id: string;
  name: string;
  tier: SubscriberTier;
  joinDate: string; // ISO date YYYY-MM-DD
  itemsOut: number;
  status: SubscriberStatus;
};

/**
 * Representative roster sample (8 of 38). Keep names stable —
 * other admin features will reference these identities.
 * James Whitaker matches the My Closet demo member (Signature).
 */
export const subscribers: Subscriber[] = [
  {
    id: "MEM-001",
    name: "James Whitaker",
    tier: "Signature",
    joinDate: "2026-03-12",
    itemsOut: 3,
    status: "Active",
  },
  {
    id: "MEM-002",
    name: "Elena Vargas",
    tier: "Starter",
    joinDate: "2026-01-08",
    itemsOut: 2,
    status: "Active",
  },
  {
    id: "MEM-003",
    name: "Marcus Chen",
    tier: "Archivist",
    joinDate: "2025-11-02",
    itemsOut: 5,
    status: "Active",
  },
  {
    id: "MEM-004",
    name: "Sofia Patel",
    tier: "Starter",
    joinDate: "2026-04-19",
    itemsOut: 1,
    status: "Paused",
  },
  {
    id: "MEM-005",
    name: "Theo Brennan",
    tier: "Signature",
    joinDate: "2026-02-01",
    itemsOut: 4,
    status: "Active",
  },
  {
    id: "MEM-006",
    name: "Nora Hale",
    tier: "Starter",
    joinDate: "2026-05-22",
    itemsOut: 3,
    status: "Active",
  },
  {
    id: "MEM-007",
    name: "Julian Okonkwo",
    tier: "Signature",
    joinDate: "2025-12-14",
    itemsOut: 2,
    status: "Active",
  },
  {
    id: "MEM-008",
    name: "Claire Duval",
    tier: "Starter",
    joinDate: "2026-06-03",
    itemsOut: 0,
    status: "Paused",
  },
];

export function getSubscriberById(id: string) {
  return subscribers.find((s) => s.id === id);
}

export function getSubscriberByName(name: string) {
  return subscribers.find((s) => s.name === name);
}
