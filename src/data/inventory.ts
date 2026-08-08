import { garments, type Garment } from "./garments";
import { activeRentals, mockMember } from "./closet";

export type InventoryStatus =
  | "In Rotation"
  | "Cleaning"
  | "Ready"
  | "Returned"
  | "Retired";

export type PipelineStage = "Returned" | "Cleaning" | "Ready" | "Shipped";

export type InventoryItem = Garment & {
  status: InventoryStatus;
  costPerCycle: number;
  margin: number;
  /** Present when status is In Rotation / pipeline stage Shipped. */
  shippedTo?: string;
};

/**
 * Status assignment is consistent with turnaround pipeline:
 * Returned/Retired → Returned column
 * Cleaning → Cleaning
 * Ready → Ready
 * In Rotation → Shipped
 *
 * James Whitaker's My Closet active rentals are forced to In Rotation
 * and labeled "Shipped to James Whitaker" in the pipeline.
 */
const statusById: Record<string, InventoryStatus> = {
  "SPEC-014": "In Rotation",
  "SPEC-021": "Cleaning",
  "SPEC-033": "In Rotation",
  "SPEC-042": "Ready",
  "SPEC-058": "Cleaning",
  "SPEC-067": "In Rotation",
  "SPEC-071": "Retired",
  "SPEC-089": "Ready",
};

const whitakerActiveIds = new Set(activeRentals.map((r) => r.garment.id));

/** Mock cost/cycle reflecting cleaning + wear/write-off risk. */
const costById: Record<string, number> = {
  "SPEC-014": 9,
  "SPEC-021": 8,
  "SPEC-033": 7,
  "SPEC-042": 6,
  "SPEC-058": 8,
  "SPEC-067": 11,
  "SPEC-071": 10,
  "SPEC-089": 6,
};

export const THIN_MARGIN_THRESHOLD = 10;

export const PIPELINE_STAGES: PipelineStage[] = [
  "Returned",
  "Cleaning",
  "Ready",
  "Shipped",
];

export function statusToPipelineStage(status: InventoryStatus): PipelineStage {
  switch (status) {
    case "Returned":
    case "Retired":
      return "Returned";
    case "Cleaning":
      return "Cleaning";
    case "Ready":
      return "Ready";
    case "In Rotation":
      return "Shipped";
  }
}

export const inventory: InventoryItem[] = garments.map((garment) => {
  const costPerCycle = costById[garment.id] ?? 0;
  const isWhitakerActive = whitakerActiveIds.has(garment.id);
  const status = isWhitakerActive
    ? "In Rotation"
    : (statusById[garment.id] ?? "Cleaning");

  return {
    ...garment,
    status,
    costPerCycle,
    margin: garment.price - costPerCycle,
    shippedTo: isWhitakerActive ? mockMember.name : undefined,
  };
});

export function getInventoryStats(items: InventoryItem[] = inventory) {
  const averageMargin =
    items.length === 0
      ? 0
      : items.reduce((sum, item) => sum + item.margin, 0) / items.length;

  return {
    total: items.length,
    inRotation: items.filter((i) => i.status === "In Rotation").length,
    cleaning: items.filter((i) => i.status === "Cleaning").length,
    retired: items.filter((i) => i.status === "Retired").length,
    averageMargin,
  };
}

export function getPipelineBoard(items: InventoryItem[] = inventory) {
  const columns = Object.fromEntries(
    PIPELINE_STAGES.map((stage) => [stage, [] as InventoryItem[]]),
  ) as Record<PipelineStage, InventoryItem[]>;

  for (const item of items) {
    columns[statusToPipelineStage(item.status)].push(item);
  }

  return columns;
}

export function isThinMargin(margin: number) {
  return margin < THIN_MARGIN_THRESHOLD;
}

const HIGH_CYCLE_THRESHOLD = 8;

function isGradeC(grade: string) {
  return grade === "C" || grade === "C+" || grade === "C-";
}

/** Items needing write-off / repair review: Grade C or 8+ cycles. */
export function getDecisionQueue(items: InventoryItem[] = inventory) {
  return items.filter(
    (item) => isGradeC(item.grade) || item.cycles >= HIGH_CYCLE_THRESHOLD,
  );
}

export function decisionReason(item: InventoryItem) {
  const reasons: string[] = [];
  if (isGradeC(item.grade)) reasons.push("Grade C");
  if (item.cycles >= HIGH_CYCLE_THRESHOLD) reasons.push(`${item.cycles} cycles`);
  return reasons.join(" · ");
}

/**
 * Reconciled demo revenue from mock subscriber mix:
 * 20 Starter @ $49 + 12 Signature @ $99 + 6 Archivist @ $159 = $3,122 MRR
 */
export const revenueSnapshot = {
  activeSubscribers: 38,
  monthlyRecurringRevenue: 3122,
  avgItemsPerSubscriber: 4.3,
  avgRevenuePerSubscriber: 82,
  tiers: {
    starter: { subscribers: 20, price: 49, avgItems: 3.0 },
    signature: { subscribers: 12, price: 99, avgItems: 5.0 },
    archivist: { subscribers: 6, price: 159, avgItems: 7.0 },
  },
  mrrTrendNote: "+8% vs. last month",
} as const;

export type RevenueStatKey =
  | "subscribers"
  | "mrr"
  | "avgItems"
  | "avgRevenue";

export type RevenueStatDetail = {
  key: RevenueStatKey;
  label: string;
  value: string;
  title: string;
  lines: string[];
  note?: string;
};

export function getRevenueStatDetails(): RevenueStatDetail[] {
  const { tiers, mrrTrendNote } = revenueSnapshot;
  const starterMrr = tiers.starter.subscribers * tiers.starter.price;
  const signatureMrr = tiers.signature.subscribers * tiers.signature.price;
  const archivistMrr = tiers.archivist.subscribers * tiers.archivist.price;

  return [
    {
      key: "subscribers",
      label: "Active Subscribers",
      value: String(revenueSnapshot.activeSubscribers),
      title: "Active Subscribers",
      lines: [
        `Starter: ${tiers.starter.subscribers}`,
        `Signature: ${tiers.signature.subscribers}`,
        `Archivist: ${tiers.archivist.subscribers}`,
      ],
    },
    {
      key: "mrr",
      label: "Monthly Recurring Revenue",
      value: `$${revenueSnapshot.monthlyRecurringRevenue.toLocaleString("en-US")}`,
      title: "Monthly Recurring Revenue",
      lines: [
        `Starter: $${starterMrr.toLocaleString("en-US")}`,
        `Signature: $${signatureMrr.toLocaleString("en-US")}`,
        `Archivist: $${archivistMrr.toLocaleString("en-US")}`,
      ],
      note: mrrTrendNote,
    },
    {
      key: "avgItems",
      label: "Avg. Items per Subscriber",
      value: String(revenueSnapshot.avgItemsPerSubscriber),
      title: "Avg. Items per Subscriber",
      lines: [
        `Starter avg: ${tiers.starter.avgItems.toFixed(1)}`,
        `Signature avg: ${tiers.signature.avgItems.toFixed(1)}`,
        `Archivist avg: ${tiers.archivist.avgItems.toFixed(1)}`,
      ],
    },
    {
      key: "avgRevenue",
      label: "Avg. Revenue per Subscriber",
      value: `$${revenueSnapshot.avgRevenuePerSubscriber}`,
      title: "Avg. Revenue per Subscriber",
      lines: [
        `Lowest tier: $${tiers.starter.price}`,
        `Highest tier: $${tiers.archivist.price}`,
        `Blended average: $${revenueSnapshot.avgRevenuePerSubscriber}`,
      ],
    },
  ];
}

const LOW_STOCK_THRESHOLD = 1;

export type SourcingAlert = {
  category: string;
  count: number;
  message: string;
};

/** Categories at or below low-stock threshold (currently 1 item). */
export function getSourcingAlerts(items: InventoryItem[] = inventory): SourcingAlert[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count <= LOW_STOCK_THRESHOLD)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, count]) => ({
      category,
      count,
      message:
        count === 1
          ? `${category}: Only 1 item in rotation — consider sourcing more`
          : `${category}: Only ${count} items in rotation — consider sourcing more`,
    }));
}
