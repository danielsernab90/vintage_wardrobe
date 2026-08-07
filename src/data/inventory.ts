import { garments, type Garment } from "./garments";

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
};

/**
 * Status assignment is consistent with turnaround pipeline:
 * Returned/Retired → Returned column
 * Cleaning → Cleaning
 * Ready → Ready
 * In Rotation → Shipped
 */
const statusById: Record<string, InventoryStatus> = {
  "SPEC-014": "In Rotation",
  "SPEC-021": "Cleaning",
  "SPEC-033": "In Rotation",
  "SPEC-042": "Ready",
  "SPEC-058": "Cleaning",
  "SPEC-067": "Returned",
  "SPEC-071": "Retired",
  "SPEC-089": "Ready",
};

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
  return {
    ...garment,
    status: statusById[garment.id] ?? "Cleaning",
    costPerCycle,
    margin: garment.price - costPerCycle,
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
