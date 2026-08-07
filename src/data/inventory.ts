import { garments, type Garment } from "./garments";

export type InventoryStatus = "In Rotation" | "Cleaning" | "Retired";

export type InventoryItem = Garment & {
  status: InventoryStatus;
  costPerCycle: number;
  margin: number;
};

/** Demo inventory overlay — status is mock-only, not on the garment catalog. */
const statusById: Record<string, InventoryStatus> = {
  "SPEC-014": "In Rotation",
  "SPEC-021": "Cleaning",
  "SPEC-033": "In Rotation",
  "SPEC-042": "In Rotation",
  "SPEC-058": "Cleaning",
  "SPEC-067": "In Rotation",
  "SPEC-071": "Retired",
  "SPEC-089": "In Rotation",
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

export function isThinMargin(margin: number) {
  return margin < THIN_MARGIN_THRESHOLD;
}
